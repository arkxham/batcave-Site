"use client"
import DraggableWindow from "@/components/windows/draggable-window"

interface DirectoryWindowProps {
  onClose: () => void
  onOpenSubDirectory: (directory: string) => void
}

export default function DirectoryWindow({ onClose, onOpenSubDirectory }: DirectoryWindowProps) {
  const mainDirectories = [
    { name: "Photos", icon: "📸", key: "photos" },
    { name: "Music", icon: "🎵", key: "music" },
    { name: "Profiles", icon: "👤", key: "profiles" },
    { name: "System", icon: "💻", key: "system" },
    { name: "Applications", icon: "📱", key: "apps" },
  ]

  return (
    <DraggableWindow
      title="Main Directory"
      onClose={onClose}
      className="window bg-[rgba(30,30,30,0.95)] rounded-lg shadow-lg min-w-[400px] min-h-[300px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 300, y: 100 }}
    >
      <div className="window-content p-4">
        <div className="directory-list space-y-3 max-h-[400px] overflow-y-auto">
          {mainDirectories.map((dir) => (
            <div
              key={dir.key}
              className="directory-item flex items-center gap-3 p-3 rounded transition-colors hover:bg-white/10 cursor-pointer"
              onClick={() => onOpenSubDirectory(dir.key)}
            >
              <div className="directory-icon-image w-12 h-12 flex items-center justify-center text-3xl bg-black/20 rounded-lg border border-white/10">
                {dir.icon}
              </div>
              <div className="directory-info">
                <div className="directory-name text-base font-medium">{dir.name}</div>
                <div className="directory-path text-xs text-gray-400">/root/{dir.name.toLowerCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DraggableWindow>
  )
}
