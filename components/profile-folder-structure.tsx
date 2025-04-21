"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"

interface ProfileFolderStructureProps {
  profileId: string
  onSelectBackground: (background: string) => void
  onSelectAvatar: (avatar: string) => void
  onSelectMusic: (songIndex: number) => void
}

export default function ProfileFolderStructure({
  profileId,
  onSelectBackground,
  onSelectAvatar,
  onSelectMusic,
}: ProfileFolderStructureProps) {
  const { userProfiles } = useUser()
  const { songs } = useAudio()
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    [profileId]: true,
  })

  const profile = userProfiles[profileId]
  if (!profile) return null

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  // Find song index for this profile
  const songIndex = songs.findIndex(
    (song) => song.title === profile.customSong.title && song.artist === profile.customSong.artist,
  )

  return (
    <div className="profile-folder-structure text-white bg-black/20 p-3 rounded-lg border border-white/10">
      <div className="folder-item">
        <div
          className="folder-header flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded"
          onClick={() => toggleFolder(profileId)}
        >
          <span className="folder-icon text-xl">{expandedFolders[profileId] ? "📂" : "📁"}</span>
          <span className="folder-name font-medium">{profile.username}</span>
        </div>

        {expandedFolders[profileId] && (
          <div className="folder-contents ml-8 mt-2 space-y-2.5">
            <div
              className="file-item flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition-colors"
              onClick={() => onSelectBackground(profile.backgroundImage)}
            >
              <span className="file-icon text-xl">🖼️</span>
              <span className="file-name">background.jpg</span>
            </div>

            <div
              className="file-item flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition-colors"
              onClick={() => onSelectAvatar(profile.avatarImageUrl)}
            >
              <span className="file-icon text-xl">👤</span>
              <span className="file-name">avatar.jpg</span>
            </div>

            <div
              className="file-item flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition-colors"
              onClick={() => onSelectMusic(songIndex)}
            >
              <span className="file-icon text-xl">🎵</span>
              <span className="file-name">{profile.customSong.title}.mp3</span>
            </div>

            <div className="file-item flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1.5 rounded transition-colors">
              <span className="file-icon text-xl">⚙️</span>
              <span className="file-name">settings.json</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
