"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"

interface TaskbarProps {
  onStartButtonClick: () => void
  onMusicPlayerClick: () => void
}

export default function Taskbar({ onStartButtonClick, onMusicPlayerClick }: TaskbarProps) {
  const { currentUser } = useUser()
  const { currentSong, isPlaying, pauseSong, resumeSong } = useAudio()
  const [time, setTime] = useState("00:00:00")
  const [timestamp, setTimestamp] = useState(Date.now()) // Add timestamp for forcing re-renders

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      setTime(`${hours}:${minutes}:${seconds}`)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [])

  // Force re-render when currentUser changes
  useEffect(() => {
    console.log("Taskbar: Current user updated to", currentUser.username)
    setTimestamp(Date.now())
  }, [currentUser])

  return (
    <div className="taskbar fixed bottom-0 w-full h-12 bg-[rgba(20,20,20,0.85)] flex items-center px-4 backdrop-blur-md z-[1000] justify-between border-t border-white/10 shadow-lg">
      <div className="taskbar-left flex items-center">
        <div
          className="start-button bg-gradient-to-r from-[#333] to-[#444] text-white py-1.5 px-5 rounded-md mr-4 cursor-pointer transition-all hover:from-[#444] hover:to-[#555] flex items-center gap-2 shadow-inner"
          id="startButton"
          onClick={onStartButtonClick}
        >
          <span className="text-lg">🦇</span>
          <span>Start</span>
        </div>

        <div className="taskbar-divider h-8 w-px bg-white/20 mx-2"></div>

        <div className="music-control flex items-center gap-3 ml-2 bg-black/30 px-3 py-1.5 rounded-md">
          <button
            onClick={onMusicPlayerClick}
            className="music-icon w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-lg">🎵</span>
          </button>

          <div className="now-playing-info flex-1 max-w-[200px]">
            <div className="now-playing-text text-white text-xs truncate">
              {currentSong ? `${currentSong.title} - ${currentSong.artist}` : "No song playing"}
            </div>
            <div className="progress-bar w-full h-1 bg-white/20 rounded-full mt-1">
              <div className="progress-fill h-full bg-white/60 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>

          <button
            onClick={isPlaying ? pauseSong : resumeSong}
            className="play-pause-btn text-white text-lg hover:text-white/80 transition-colors"
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>
        </div>
      </div>

      <div className="taskbar-right flex items-center gap-4">
        <div className="user-badge flex items-center bg-black/30 px-3 py-1 rounded-md border border-white/10">
          <div className="user-name text-white text-sm font-medium">{currentUser.username}</div>
        </div>

        <div className="desktop-clock text-white text-sm bg-black/30 px-3 py-1.5 rounded-md border border-white/10">
          {time}
        </div>
      </div>
    </div>
  )
}
