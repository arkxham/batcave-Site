"use client"

import type React from "react"

import { useState } from "react"
import DraggableWindow from "@/components/windows/draggable-window"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"

interface UserProfileWindowProps {
  userId?: string
  onClose: () => void
}

export default function UserProfileWindow({ userId, onClose }: UserProfileWindowProps) {
  const { userProfiles, currentUser, updateUserProfile } = useUser()
  const { showNotification } = useAudio()

  // Use provided userId or default to current user
  const profileId = userId || currentUser.id
  const profile = userProfiles[profileId]

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    bio: profile.bio,
    twitterUrl: profile.twitterUrl,
    twitchUrl: profile.twitchUrl,
    githubUrl: profile.githubUrl,
    steamUrl: profile.steamUrl,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    updateUserProfile(profileId, formData)
    setEditMode(false)
    showNotification("Profile Updated", "Your profile has been updated successfully", "👤")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <DraggableWindow
      title={`User Profile: ${profile.username}`}
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg w-[600px] min-h-[400px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 200, y: 100 }}
    >
      <div className="window-content p-6 max-h-[500px] overflow-y-auto">
        <div className="profile-header flex items-center gap-6 mb-6 pb-6 border-b border-white/20">
          <div className="profile-avatar w-24 h-24 rounded-full overflow-hidden border-2 border-white/50">
            <img
              src={profile.avatarImageUrl || "/placeholder.svg"}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="profile-info flex-1">
            <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
            <div className="text-sm text-gray-300 mb-2">
              {profile.isAdmin ? (
                <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs mr-2">Admin</span>
              ) : null}
              Member since {formatDate(profile.createdAt)}
            </div>
            <div className="text-sm text-gray-400">Last login: {formatDate(profile.lastLogin)}</div>
          </div>
          {currentUser.id === profileId && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>

        {editMode ? (
          <div className="profile-edit">
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Twitter URL</label>
              <input
                type="text"
                name="twitterUrl"
                value={formData.twitterUrl}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Twitch URL</label>
              <input
                type="text"
                name="twitchUrl"
                value={formData.twitchUrl}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">GitHub URL</label>
              <input
                type="text"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Steam URL</label>
              <input
                type="text"
                name="steamUrl"
                value={formData.steamUrl}
                onChange={handleChange}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">About</h3>
              <p className="text-gray-300">{profile.bio}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Theme:</span>
                  <span className="capitalize">{profile.preferences.theme}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Accent Color:</span>
                  <div
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: profile.preferences.accentColor }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Font Size:</span>
                  <span className="capitalize">{profile.preferences.fontSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Animations:</span>
                  <span>{profile.preferences.animations ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:underline"
                  >
                    <span>🐦</span> Twitter
                  </a>
                )}

                {profile.twitchUrl && (
                  <a
                    href={profile.twitchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:underline"
                  >
                    <span>📺</span> Twitch
                  </a>
                )}

                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:underline"
                  >
                    <span>💻</span> GitHub
                  </a>
                )}

                {profile.steamUrl && (
                  <a
                    href={profile.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-300 hover:underline"
                  >
                    <span>🎮</span> Steam
                  </a>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Current Theme</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded overflow-hidden border border-white/20">
                  <img
                    src={profile.backgroundImage || "/placeholder.svg"}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm mb-1">Current Song:</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded overflow-hidden">
                      <img
                        src={profile.customSong.thumbnail || "/placeholder.svg"}
                        alt={profile.customSong.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{profile.customSong.title}</div>
                      <div className="text-xs text-gray-400">{profile.customSong.artist}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DraggableWindow>
  )
}
