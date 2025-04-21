"use client"

import { useState } from "react"
import DraggableWindow from "@/components/windows/draggable-window"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"

interface UserPreferencesWindowProps {
  onClose: () => void
}

export default function UserPreferencesWindow({ onClose }: UserPreferencesWindowProps) {
  const { currentUser, updateUserPreference } = useUser()
  const { showNotification } = useAudio()

  const [preferences, setPreferences] = useState(currentUser.preferences)

  const handleChange = (key: keyof typeof preferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    // Update each preference individually
    Object.entries(preferences).forEach(([key, value]) => {
      updateUserPreference(currentUser.id, key as keyof typeof preferences, value)
    })

    showNotification("Preferences Saved", "Your preferences have been updated", "⚙️")
  }

  const accentColors = [
    { name: "Blue", value: "#0078d7" },
    { name: "Red", value: "#e91e63" },
    { name: "Green", value: "#4caf50" },
    { name: "Purple", value: "#9c27b0" },
    { name: "Orange", value: "#ff9800" },
    { name: "Teal", value: "#009688" },
    { name: "Pink", value: "#e91e63" },
    { name: "Cyan", value: "#00bcd4" },
  ]

  return (
    <DraggableWindow
      title="User Preferences"
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg w-[600px] min-h-[400px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 250, y: 120 }}
    >
      <div className="window-content p-6 max-h-[500px] overflow-y-auto">
        <div className="preferences-section mb-6">
          <h3 className="text-lg font-medium mb-4 border-b border-white/20 pb-2">Appearance</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Font Size</label>
              <select
                value={preferences.fontSize}
                onChange={(e) => handleChange("fontSize", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {accentColors.map((color) => (
                <div
                  key={color.value}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                    preferences.accentColor === color.value ? "ring-2 ring-white scale-110" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleChange("accentColor", color.value)}
                  title={color.name}
                ></div>
              ))}
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="animations"
              checked={preferences.animations}
              onChange={(e) => handleChange("animations", e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="animations" className="text-sm">
              Enable animations
            </label>
          </div>
        </div>

        <div className="preferences-section mb-6">
          <h3 className="text-lg font-medium mb-4 border-b border-white/20 pb-2">Layout</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Desktop Layout</label>
              <select
                value={preferences.desktopLayout}
                onChange={(e) => handleChange("desktopLayout", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Taskbar Position</label>
              <select
                value={preferences.taskbarPosition}
                onChange={(e) => handleChange("taskbarPosition", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded p-2 text-white"
              >
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        <div className="preferences-section mb-6">
          <h3 className="text-lg font-medium mb-4 border-b border-white/20 pb-2">Behavior</h3>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="autoPlayMusic"
              checked={preferences.autoPlayMusic}
              onChange={(e) => handleChange("autoPlayMusic", e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="autoPlayMusic" className="text-sm">
              Auto-play music on login
            </label>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="showClock"
              checked={preferences.showClock}
              onChange={(e) => handleChange("showClock", e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showClock" className="text-sm">
              Show clock in taskbar
            </label>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="showNotifications"
              checked={preferences.showNotifications}
              onChange={(e) => handleChange("showNotifications", e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showNotifications" className="text-sm">
              Show notifications
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </DraggableWindow>
  )
}
