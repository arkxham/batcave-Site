"use client"

export default function DesktopIcons({
  onFolderOpen,
  onSettingsOpen,
  onDirectoryOpen,
  onProfilesOpen,
  onAdminOpen,
}: {
  onFolderOpen: (folder: string) => void
  onSettingsOpen: () => void
  onDirectoryOpen: () => void
  onProfilesOpen: () => void
  onAdminOpen: () => void
}) {
  const desktopIcons = [
    { id: "documents", name: "Documents", icon: "📁", action: () => onFolderOpen("documents") },
    { id: "pictures", name: "Pictures", icon: "📁", action: () => onFolderOpen("pictures") },
    { id: "profiles", name: "Profiles", icon: "👤", action: () => onProfilesOpen() },
    { id: "settings", name: "Settings", icon: "⚙️", action: () => onSettingsOpen() },
    { id: "directory", name: "Directory", icon: "🗂️", action: () => onDirectoryOpen() },
    { id: "admin", name: "Admin", icon: "🔐", action: () => onAdminOpen() },
  ]

  return (
    <div className="desktop-icons-container absolute left-6 top-6 w-[90px]">
      {desktopIcons.map((icon, index) => (
        <div
          key={icon.id}
          className="desktop-icon flex flex-col items-center text-white text-center cursor-pointer group mb-6"
          onClick={icon.action}
        >
          <div className="icon-container w-[60px] h-[60px] flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 mb-1 group-hover:bg-black/40 group-hover:border-white/30 transition-all duration-200">
            <div className="icon-image text-3xl">{icon.icon}</div>
          </div>
          <div className="icon-text text-xs bg-black/40 px-2 py-0.5 rounded max-w-[80px] truncate text-shadow-md">
            {icon.name}
          </div>
        </div>
      ))}
    </div>
  )
}
