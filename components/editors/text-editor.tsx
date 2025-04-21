"use client"

import { useState } from "react"

interface TextEditorProps {
  fileName: string
  content: string
  onClose: () => void
  onSave: (content: string) => void
}

export default function TextEditor({ fileName, content, onClose, onSave }: TextEditorProps) {
  const [textContent, setTextContent] = useState(content)

  const handleSave = () => {
    onSave(textContent)
  }

  return (
    <div className="text-editor fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg text-white z-[2000] overflow-hidden">
      <div className="text-editor-header bg-[rgba(68,68,68,0.8)] p-2.5 flex justify-between items-center border-b border-[#444]">
        <div className="text-editor-title font-bold">Edit: {fileName}</div>
        <button className="close-button bg-transparent border-none text-white cursor-pointer" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="text-editor-content p-4">
        <textarea
          className="w-full h-[300px] bg-[#222] text-white border border-[#444] p-2.5 font-mono resize-none rounded"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
        />

        <div className="text-editor-buttons flex justify-end gap-2.5 mt-4">
          <button
            className="text-editor-button save-button py-2 px-4 bg-[#0078d7] text-white border-none rounded cursor-pointer w-auto hover:bg-[#0086f0]"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="text-editor-button py-2 px-4 bg-[#444] text-white border-none rounded cursor-pointer w-auto hover:bg-[#555]"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
