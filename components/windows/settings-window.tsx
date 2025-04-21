"use client"

import type React from "react"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"
import DraggableWindow from "@/components/windows/draggable-window"

interface SettingsWindowProps {
  onClose: () => void
  onBackgroundChange: (background: string) => void
  currentBackground: string
}

export default function SettingsWindow({ onClose, onBackgroundChange, currentBackground }: SettingsWindowProps) {
  const { currentUser, setCurrentUser, userProfiles } = useUser()
  const { volume, setVolume } = useAudio()

  const backgrounds = [
    { id: "bg1", url: "/Photos/Default-Batman.jpg", label: "Cover 1" },
    { id: "bg2", url: "/Photos/badbih.png", label: "Cover 2" },
    { id: "bg3", url: "/Photos/Forest.png", label: "Cover 3" },
    { id: "bg4", url: "/Photos/batman4.jpg", label: "Cover 4" },
  ]

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentUser(e.target.value)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value)
    setVolume(newVolume)
  }

  const handleBackgroundSelect = (bgUrl: string) => {
    onBackgroundChange(bgUrl)
  }

  return (
    <DraggableWindow
      title="Settings"
      onClose={onClose}
      className="settings-window w-[600px] bg-[rgba(24,24,27,0.95)] rounded-xl shadow-2xl backdrop-blur-[10px] text-white z-100 border border-[rgba(63,63,70,0.5)] overflow-hidden"
      defaultPosition={{ x: 100, y: 100 }}
    >
      <div className="settings-content max-h-[70vh] overflow-y-auto p-6">
        <div className="settings-section mb-8 p-5 bg-[rgba(39,39,42,0.5)] rounded-lg">
          <h3 className="mt-0 mb-5 text-white text-base border-b border-white/10 pb-3">User Profile</h3>
          <div className="user-selector">
            <label htmlFor="userSelect" className="user-selector-label text-white text-sm">
              Select User:
            </label>
            <select
              id="userSelect"
              className="user-selector-dropdown bg-[rgba(60,60,60,0.8)] text-white border border-white/20 rounded py-1 px-2.5 cursor-pointer mt-2"
              value={currentUser.id}
              onChange={handleUserChange}
            >
              {Object.keys(userProfiles).map((userId) => (
                <option key={userId} value={userId}>
                  {userProfiles[userId].username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="settings-section mb-8 p-5 bg-[rgba(39,39,42,0.5)] rounded-lg">
          <h3 className="mt-0 mb-5 text-white text-base border-b border-white/10 pb-3">Volume Control</h3>
          <div className="volume-control flex items-center gap-4 py-2">
            <span className="volume-icon text-base min-w-5 text-center">
              {volume === 0 ? "🔇" : volume < 50 ? "🔈" : "🔊"}
            </span>
            <input
              type="range"
              className="volume-slider flex-grow h-1.5 bg-[#444] rounded appearance-none cursor-pointer outline-none"
              id="volumeSlider"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
            />
            <span id="volumeValue" className="volume-value min-w-[50px] text-right font-medium">
              {volume}%
            </span>
          </div>
        </div>

        <div className="settings-section mb-8 p-5 bg-[rgba(39,39,42,0.5)] rounded-lg">
          <h3 className="mt-0 mb-5 text-white text-base border-b border-white/10 pb-3">Desktop Background</h3>
          <div className="background-grid grid grid-cols-2 gap-4">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`background-option relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 ease-in-out border-2 ${currentBackground === bg.url ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.5)]" : "border-transparent"} hover:scale-[1.03]`}
                data-bg={bg.url}
                onClick={() => handleBackgroundSelect(bg.url)}
              >
                <img
                  src={bg.url || "/placeholder.svg"}
                  alt={bg.label}
                  className="background-image aspect-video w-full object-cover"
                />
                <div className="background-label absolute bottom-0 left-0 right-0 bg-black/70 py-2 px-3 text-xs">
                  {bg.label}
                </div>
                {currentBackground === bg.url && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-white bg-black/50 w-8 h-8 rounded-full flex items-center justify-center text-shadow-lg">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DraggableWindow>
  )
}
