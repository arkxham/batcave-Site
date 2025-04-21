"use client"

import DraggableWindow from "@/components/windows/draggable-window"

interface PicturesWindowProps {
  onClose: () => void
  onFileOpen: (fileName: string, fileType: string, content?: string, url?: string) => void
}

export default function PicturesWindow({ onClose, onFileOpen }: PicturesWindowProps) {
  const files = [
    { name: "family_photo.jpg", type: "image", icon: "🖼️", displayName: "Randal.jpg", url: "/Photos/randal.jpg" },
    { name: "batmobile.png", type: "image", icon: "🖼️", displayName: "Fine Shyt.png", url: "/Photos/fynshi.jpg" },
    { name: "tripout.gif", type: "image", icon: "🖼️", displayName: "Tripout.jpg", url: "/Photos/n333mo-tripout.gif" },
    { name: "yungthug.mp4", type: "video", icon: "📹", displayName: "Young Thug.mp4", url: "/Photos/yungthug.mp4" },
    { name: "zebra.png", type: "image", icon: "🖼️", displayName: "Zebra.png", url: "/Photos/zebra.png" },
    { name: "N333MO.png", type: "image", icon: "🖼️", displayName: "Self Portrait.png", url: "/Photos/N333MO.jpg" },
    { name: "LOSSAVE.png", type: "image", icon: "🖼️", displayName: "Los Save Us.png", url: "/Photos/LOSSAVEUS.png" },
    { name: "Blat.png", type: "image", icon: "🖼️", displayName: "Blatt.png", url: "/Photos/Blattt.jpg" },
    { name: "Dawg.png", type: "image", icon: "🖼️", displayName: "Dawg.png", url: "/Photos/Dawg.jpg" },
    {
      name: "OneOfDem.png",
      type: "image",
      icon: "🖼️",
      displayName: "One Of Them Nights.png",
      url: "/Photos/JustOneOfDem.jpg",
    },
    { name: "DownyTwo.png", type: "image", icon: "🖼️", displayName: "asalamalakim.png", url: "/Photos/Downy.jpg" },
    { name: "BadBihBeat.png", type: "image", icon: "🖼️", displayName: "My Dreams.png", url: "/Photos/BadBihBeat.jpg" },
  ]

  return (
    <DraggableWindow
      title="Pictures"
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg min-w-[400px] min-h-[300px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 250, y: 150 }}
    >
      <div className="window-content p-4 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 max-h-[400px] overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.name}
            className="file-icon flex flex-col items-center cursor-pointer p-1 rounded transition-colors hover:bg-white/10"
            data-file={file.name}
            data-type={file.type}
            onClick={() => onFileOpen(file.name, file.type, undefined, file.url)}
          >
            <div className="file-icon-image w-10 h-10 mb-1 flex items-center justify-center text-2xl">{file.icon}</div>
            <div className="file-icon-text text-xs text-center break-words">{file.displayName}</div>
          </div>
        ))}
      </div>
    </DraggableWindow>
  )
}
