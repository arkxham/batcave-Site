"use client"

import DraggableWindow from "@/components/windows/draggable-window"
import { useAudio } from "@/context/audio-context"

interface MusicDirectoryWindowProps {
  onClose: () => void
}

export default function MusicDirectoryWindow({ onClose }: MusicDirectoryWindowProps) {
  const { songs, setCurrentSongIndex, playSong, showNotification } = useAudio()

  const musicCategories = [
    {
      name: "User Themes",
      songs: songs.filter((_, index) => index < 5),
    },
    {
      name: "Popular Tracks",
      songs: songs.filter((_, index) => index >= 5 && index < 8),
    },
    {
      name: "Other Music",
      songs: songs.filter((_, index) => index >= 8),
    },
  ]

  const handleSongSelect = (songIndex: number) => {
    setCurrentSongIndex(songIndex)
    playSong()
    showNotification("Now Playing", `${songs[songIndex].title} by ${songs[songIndex].artist}`, "🎵")
  }

  // Find the overall index of a song
  const findSongIndex = (categoryIndex: number, songIndex: number): number => {
    let totalIndex = songIndex
    for (let i = 0; i < categoryIndex; i++) {
      totalIndex += musicCategories[i].songs.length
    }
    return totalIndex
  }

  return (
    <DraggableWindow
      title="Music Directory"
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg w-[600px] min-h-[400px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 220, y: 120 }}
    >
      <div className="window-content p-4 max-h-[500px] overflow-y-auto">
        {musicCategories.map((category, categoryIndex) => (
          <div key={category.name} className="mb-6">
            <h3 className="text-lg font-medium mb-3 border-b border-white/20 pb-2">{category.name}</h3>
            <div className="grid grid-cols-1 gap-2">
              {category.songs.map((song, songIndex) => {
                const overallIndex = findSongIndex(categoryIndex, songIndex)
                return (
                  <div
                    key={`${song.title}-${songIndex}`}
                    className="song-item p-3 rounded cursor-pointer transition-colors flex items-center gap-4 hover:bg-white/10"
                    onClick={() => handleSongSelect(overallIndex)}
                  >
                    <img
                      src={song.thumbnail || "/Photos/default-music.jpg"}
                      className="song-thumbnail w-12 h-12 rounded object-cover"
                      alt={song.title}
                    />
                    <div className="song-info flex-1">
                      <div className="song-title text-base font-medium text-white">{song.title}</div>
                      <div className="song-artist text-sm text-[#b3b3b3]">{song.artist}</div>
                    </div>
                    <div className="song-play-icon text-xl">▶️</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </DraggableWindow>
  )
}
