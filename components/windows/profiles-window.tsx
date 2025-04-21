"use client"

import { useEffect, useState } from "react"
import DraggableWindow from "@/components/windows/draggable-window"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"
import { supabase } from "@/lib/supabase-client"

interface ProfilesWindowProps {
  onClose: () => void
  onProfileSelect: (profileId: string) => void
  onViewProfile?: (username: string) => void
}

interface SupabaseProfile {
  id: string
  username: string
  profile_picture_url: string | null
  background_url: string | null
  background_song_url: string | null
  updated_at: string
  created_at: string
}

export default function ProfilesWindow({ onClose, onProfileSelect, onViewProfile }: ProfilesWindowProps) {
  const { userProfiles, currentUser } = useUser()
  const { showNotification } = useAudio()
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"profiles" | "details">("profiles")
  const [supabaseProfiles, setSupabaseProfiles] = useState<SupabaseProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch profiles from Supabase
    const fetchProfiles = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, profile_picture_url, background_url, background_song_url, updated_at, created_at")
          .order("username")

        if (error) {
          console.error("Error fetching profiles:", error)
          throw error
        }

        if (data) {
          setSupabaseProfiles(data)
        }
      } catch (error) {
        console.error("Error fetching profiles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleProfileClick = (profileId: string) => {
    setSelectedProfile(profileId)
    setActiveTab("details")
  }

  const handleApplyProfile = () => {
    if (selectedProfile) {
      onProfileSelect(selectedProfile)
      showNotification("Profile Changed", `Switched to ${selectedProfile}'s profile`, "👤")
    }
  }

  const handleBackToProfiles = () => {
    setActiveTab("profiles")
  }

  // Find a Supabase profile by username
  const findProfileByUsername = (username: string): SupabaseProfile | undefined => {
    return supabaseProfiles.find((profile) => profile.username.toLowerCase() === username.toLowerCase())
  }

  // Get profile picture URL
  const getProfilePicture = (username: string): string => {
    const profile = findProfileByUsername(username)
    return profile?.profile_picture_url || userProfiles[username.toLowerCase()]?.avatarImageUrl || "/placeholder.svg"
  }

  return (
    <DraggableWindow
      title="User Profiles"
      onClose={onClose}
      className="window bg-[rgba(30,30,30,0.95)] rounded-lg shadow-lg min-w-[700px] min-h-[500px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 250, y: 120 }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading profiles...</span>
        </div>
      ) : activeTab === "profiles" ? (
        <div className="window-content p-6">
          <div className="profiles-header mb-4 pb-2 border-b border-white/20">
            <h2 className="text-xl font-semibold">Available Profiles</h2>
            <p className="text-sm text-gray-400">Select a profile to view or configure</p>
          </div>

          <div className="profiles-list space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {supabaseProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`profile-card p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentUser.username.toLowerCase() === profile.username.toLowerCase()
                    ? "bg-blue-900/30 border-2 border-blue-500/50"
                    : "bg-black/30 border border-white/10 hover:bg-black/50"
                }`}
                onClick={() => handleProfileClick(profile.username)}
              >
                <div className="flex items-start">
                  <div className="profile-avatar w-12 h-12 rounded-full overflow-hidden border border-white/30 mr-4 flex-shrink-0">
                    <img
                      src={profile.profile_picture_url || "/placeholder.svg"}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="profile-name font-medium">{profile.username}</div>
                        <div className="profile-status text-xs text-gray-400">
                          Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      {currentUser.username.toLowerCase() === profile.username.toLowerCase() && (
                        <div className="current-profile-badge text-xs bg-blue-500/30 py-0.5 px-2 rounded">Current</div>
                      )}
                    </div>

                    <div className="profile-folder-structure text-xs text-gray-300 bg-black/30 p-2 rounded">
                      <div className="folder-item flex items-center gap-1 mb-1">
                        <span>📁</span> {profile.username}/
                      </div>
                      <div className="ml-5 space-y-1">
                        {profile.background_url && (
                          <div className="folder-item flex items-center gap-1">
                            <span>🖼️</span> background.jpg
                          </div>
                        )}
                        {profile.background_song_url && (
                          <div className="folder-item flex items-center gap-1">
                            <span>🎵</span> theme.mp3
                          </div>
                        )}
                        {profile.profile_picture_url && (
                          <div className="folder-item flex items-center gap-1">
                            <span>👤</span> avatar.jpg
                          </div>
                        )}
                        <div className="folder-item flex items-center gap-1">
                          <span>⚙️</span> settings.json
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {onViewProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewProfile(profile.username)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs transition-colors"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="window-content p-6">
          {selectedProfile && (
            <div className="profile-details">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handleBackToProfiles}
                  className="back-button flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                >
                  ← Back to Profiles
                </button>

                <button
                  onClick={handleApplyProfile}
                  className="apply-button bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  Apply This Profile
                </button>
              </div>

              {(() => {
                const profile = findProfileByUsername(selectedProfile)

                if (!profile) {
                  return <div className="text-center text-gray-400">Profile not found</div>
                }

                return (
                  <>
                    <div className="profile-header flex gap-6 mb-6 pb-4 border-b border-white/20">
                      <div className="profile-avatar-large w-32 h-32 rounded-lg overflow-hidden border-2 border-white/30">
                        <img
                          src={profile.profile_picture_url || "/placeholder.svg"}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="profile-info flex-1">
                        <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
                        <div className="text-sm text-gray-300 mb-3">Profile ID: {profile.id}</div>

                        <div className="profile-stats flex gap-4 text-xs">
                          <div className="stat bg-black/30 px-3 py-1 rounded">
                            Created: {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                          <div className="stat bg-black/30 px-3 py-1 rounded">
                            Updated: {new Date(profile.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-assets space-y-4">
                      <div className="asset-card bg-black/20 rounded-lg overflow-hidden border border-white/10">
                        <div className="asset-header bg-black/40 px-4 py-2 text-sm font-medium">Background Image</div>
                        <div className="asset-content p-4">
                          <div className="bg-image-preview h-40 rounded overflow-hidden mb-2">
                            <img
                              src={profile.background_url || "/placeholder.svg"}
                              alt="Background"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="asset-path text-xs text-gray-400">
                            Path: /Profiles/{profile.username}/background.jpg
                          </div>
                        </div>
                      </div>

                      <div className="asset-card bg-black/20 rounded-lg overflow-hidden border border-white/10">
                        <div className="asset-header bg-black/40 px-4 py-2 text-sm font-medium">Theme Music</div>
                        <div className="asset-content p-4">
                          {profile.background_song_url ? (
                            <>
                              <div className="music-preview flex items-center gap-3 mb-3">
                                <div className="music-thumbnail w-16 h-16 rounded overflow-hidden bg-gray-700 flex items-center justify-center">
                                  <span className="text-2xl">🎵</span>
                                </div>
                                <div>
                                  <div className="music-title font-medium">{profile.username}'s Theme</div>
                                  <audio
                                    controls
                                    className="mt-2 w-full max-w-xs"
                                    src={profile.background_song_url}
                                  ></audio>
                                </div>
                              </div>
                              <div className="asset-path text-xs text-gray-400">
                                Path: /Profiles/{profile.username}/theme.mp3
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-gray-400 py-4">No theme music available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </DraggableWindow>
  )
}
