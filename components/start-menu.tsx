"use client"

import { useUser } from "@/context/user-context"

interface StartMenuProps {
  onItemClick: (item: string) => void
}

export default function StartMenu({ onItemClick }: StartMenuProps) {
  const { currentUser } = useUser()

  return (
    <div
      className="start-menu absolute bottom-10 left-0 w-[300px] bg-[rgba(30,30,30,0.95)] rounded-t-lg shadow-lg backdrop-blur-[10px] z-[1001] overflow-hidden animate-[slideUp_0.2s_ease-out] pointer-events-auto"
      id="startMenu"
    >
      <div className="start-menu-header p-4 border-b border-white/10 flex items-center">
        <div
          className="start-menu-user flex items-center gap-2.5 cursor-pointer hover:bg-white/10 p-2 rounded w-full"
          onClick={() => onItemClick("userProfile")}
        >
          <div className="start-menu-avatar w-10 h-10 rounded-full overflow-hidden">
            <img
              src={currentUser.avatarImageUrl || "/placeholder.svg"}
              alt={currentUser.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="start-menu-username text-white font-bold" id="startMenuUsername">
              {currentUser.username}
            </div>
            <div className="text-xs text-gray-400">View profile</div>
          </div>
        </div>
      </div>

      <div className="start-menu-content max-h-[400px] overflow-y-auto">
        <div className="start-menu-section p-2.5 px-4">
          <div className="start-menu-title text-[#999] text-xs mb-2.5 uppercase">Apps</div>

          <div className="start-menu-items flex flex-col gap-1">
            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              data-folder="documents"
              onClick={() => onItemClick("documents")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">📁</div>
              <div className="start-menu-label text-white text-sm">Documents</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              data-folder="pictures"
              onClick={() => onItemClick("pictures")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">📁</div>
              <div className="start-menu-label text-white text-sm">Pictures</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              id="startMenuDirectory"
              onClick={() => onItemClick("directory")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">🗂️</div>
              <div className="start-menu-label text-white text-sm">Directory</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              id="startMenuSettings"
              onClick={() => onItemClick("settings")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">⚙️</div>
              <div className="start-menu-label text-white text-sm">Settings</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              id="startMenuMusic"
              onClick={() => onItemClick("music")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">🎵</div>
              <div className="start-menu-label text-white text-sm">Music Player</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              id="startMenuAdmin"
              onClick={() => onItemClick("admin")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">🔐</div>
              <div className="start-menu-label text-white text-sm">Admin</div>
            </div>
          </div>
        </div>

        <div className="start-menu-section p-2.5 px-4">
          <div className="start-menu-title text-[#999] text-xs mb-2.5 uppercase">User</div>

          <div className="start-menu-items flex flex-col gap-1">
            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              onClick={() => onItemClick("userProfile")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">👤</div>
              <div className="start-menu-label text-white text-sm">My Profile</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              onClick={() => onItemClick("userFiles")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">📂</div>
              <div className="start-menu-label text-white text-sm">My Files</div>
            </div>

            <div
              className="start-menu-item flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-white/10"
              onClick={() => onItemClick("userPreferences")}
            >
              <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">🔧</div>
              <div className="start-menu-label text-white text-sm">Preferences</div>
            </div>
          </div>
        </div>
      </div>

      <div className="start-menu-footer p-4 border-t border-white/10 flex justify-between">
        <div
          className="start-menu-power flex items-center gap-2.5 text-white cursor-pointer p-1 px-2.5 rounded transition-colors hover:bg-white/10"
          id="powerButton"
          onClick={() => onItemClick("power")}
        >
          <div className="start-menu-icon w-6 h-6 flex items-center justify-center text-lg text-white">⏻</div>
          <div className="start-menu-label text-white text-sm">Power</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
