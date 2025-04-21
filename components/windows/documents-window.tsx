"use client"

import DraggableWindow from "@/components/windows/draggable-window"
import { useAudio } from "@/context/audio-context"

interface DocumentsWindowProps {
  onClose: () => void
  onFileOpen: (fileName: string, fileType: string, content?: string) => void
}

export default function DocumentsWindow({ onClose, onFileOpen }: DocumentsWindowProps) {
  const { fileContents } = useAudio()

  const files = [
    { name: "secret_plans.txt", type: "text", icon: "📄" },
    { name: "Plans To Kill Lydell.doc", type: "text", icon: "📄" },
    { name: "Credits.txt", type: "text", icon: "📄" },
  ]

  return (
    <DraggableWindow
      title="Documents"
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg min-w-[400px] min-h-[300px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 200, y: 120 }}
    >
      <div className="window-content p-4 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 max-h-[400px] overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.name}
            className="file-icon flex flex-col items-center cursor-pointer p-1 rounded transition-colors hover:bg-white/10"
            data-file={file.name}
            data-type={file.type}
            onClick={() => onFileOpen(file.name, file.type, fileContents[file.name])}
          >
            <div className="file-icon-image w-10 h-10 mb-1 flex items-center justify-center text-2xl">{file.icon}</div>
            <div className="file-icon-text text-xs text-center break-words">{file.name}</div>
          </div>
        ))}
      </div>
    </DraggableWindow>
  )
}
