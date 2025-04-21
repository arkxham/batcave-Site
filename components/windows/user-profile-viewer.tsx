"use client"

import { useState, useEffect } from "react"
import DraggableWindow from "@/components/windows/draggable-window"
import { supabase } from "@/lib/supabase-client"
import { useAudio } from "@/context/audio-context"
import { useUser } from "@/context/user-context"

interface UserProfileViewerProps {
  onClose: () => void
  username?: string // Optional username
}

export default function UserProfileViewer({ onClose, username }: UserProfileViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const { showNotification, playSongByUrl } = useAudio()
  const { setCurrentUser } = useUser()
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now())

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    setCacheTimestamp(Date.now()) // Refresh cache timestamp

    try {
      let query = supabase.from("profiles").select("*")

      if (username) {
        query = query.ilike("username", username)
      }

      const { data, error } = await query.single()

      if (error) throw error

      setProfile(data)
    } catch (error: any) {
      console.error("Error fetching profile:", error.message)
      setError("Failed to load profile. Please try again.")
      showNotification("Error", "Failed to load profile", "❌")
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySong = () => {
    if (profile?.background_song_url) {
      playSongByUrl(`${profile.background_song_url}?t=${cacheTimestamp}`, profile.username)
    }
  }

  const handleApplyBackground = () => {
    if (profile?.background_url) {
      // You could integrate this with your desktop background setter
      showNotification("Background Applied", `Applied ${profile.username}'s background`, "🖼️")
    }
  }

  const handleSwitchToProfile = () => {
    if (profile?.username) {
      setCurrentUser(profile.username)
      showNotification("Profile Changed", `Switched to ${profile.username}'s profile`, "👤")
      onClose()
    }
  }

  return (
    <DraggableWindow
      title={`User Profile: ${profile?.username || "Loading..."}`}
      onClose={onClose}
      className="window bg-[rgba(30,30,30,0.95)] rounded-lg shadow-lg w-[600px] min-h-[400px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 200, y: 100 }}
    >
      <div className="window-content p-6">
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 text-red-300 p-4 rounded text-center">{error}</div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="profile-header flex items-center gap-6">
              <div className="profile-avatar w-24 h-24 rounded-full overflow-hidden border-2 border-white/30">
                {profile.profile_picture_url ? (
                  <img
                    src={`${profile.profile_picture_url}?t=${cacheTimestamp}`}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl">
                    {profile.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
                <div className="text-sm text-gray-400">
                  Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                </div>
                <button
                  onClick={handleSwitchToProfile}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
                >
                  Switch to This Profile
                </button>
              </div>
            </div>

            <div className="profile-background">
              <h3 className="text-lg font-medium mb-2">Background</h3>
              {profile.background_url ? (
                <div className="relative">
                  <img
                    src={`${profile.background_url}?t=${cacheTimestamp}`}
                    alt="Background"
                    className="w-full h-40 object-cover rounded"
                  />
                  <button
                    onClick={handleApplyBackground}
                    className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white py-1 px-3 rounded text-sm transition-colors"
                  >
                    Apply Background
                  </button>
                </div>
              ) : (
                <div className="bg-gray-800 h-40 rounded flex items-center justify-center text-gray-500">
                  No background image uploaded
                </div>
              )}
            </div>

            <div className="profile-song">
              <h3 className="text-lg font-medium mb-2">Theme Song</h3>
              {profile.background_song_url ? (
                <div className="bg-gray-800 p-4 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-700 p-2 rounded-full mr-3">
                        <span className="text-xl">🎵</span>
                      </div>
                      <div>
                        <div className="font-medium">{profile.username}'s Theme</div>
                      </div>
                    </div>
                    <button
                      onClick={handlePlaySong}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      Play
                    </button>
                  </div>
                  <audio
                    controls
                    className="mt-4 w-full"
                    src={`${profile.background_song_url}?t=${cacheTimestamp}`}
                  ></audio>
                </div>
              ) : (
                <div className="bg-gray-800 p-4 rounded flex items-center justify-center text-gray-500">
                  No theme song uploaded
                </div>
              )}
            </div>

            <div className="profile-social">
              <h3 className="text-lg font-medium mb-2">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">🐦</span>
                    <span>Twitter</span>
                  </a>
                )}
                {profile.twitch_url && (
                  <a
                    href={profile.twitch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">📺</span>
                    <span>Twitch</span>
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">💻</span>
                    <span>GitHub</span>
                  </a>
                )}
                {profile.steam_url && (
                  <a
                    href={profile.steam_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">🎮</span>
                    <span>Steam</span>
                  </a>
                )}
                {!profile.twitter_url && !profile.twitch_url && !profile.github_url && !profile.steam_url && (
                  <div className="col-span-2 bg-gray-800 p-4 rounded text-center text-gray-500">
                    No social links available
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">No profile found</div>
        )}
      </div>
    </DraggableWindow>
  )
}
