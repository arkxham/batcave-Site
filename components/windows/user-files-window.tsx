"use client"

import type React from "react"

import { useState } from "react"
import DraggableWindow from "@/components/windows/draggable-window"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"

interface UserFilesWindowProps {
  onClose: () => void
  onFileOpen: (fileName: string, fileType: string, content?: string, url?: string) => void
}

export default function UserFilesWindow({ onClose, onFileOpen }: UserFilesWindowProps) {
  const { currentUser, getUserFiles, getFavoriteFiles, getRecentFiles, toggleFileFavorite, deleteUserFile } = useUser()
  const { showNotification } = useAudio()

  const [activeTab, setActiveTab] = useState<"all" | "documents" | "images" | "favorites" | "recent">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Get files based on active tab
  const getFilesForTab = () => {
    switch (activeTab) {
      case "documents":
        return getUserFiles(currentUser.id, "document")
      case "images":
        return getUserFiles(currentUser.id, "image")
      case "favorites":
        return getFavoriteFiles(currentUser.id)
      case "recent":
        return getRecentFiles(currentUser.id, 10)
      default:
        return getUserFiles(currentUser.id)
    }
  }

  // Filter files by search query
  const filteredFiles = getFilesForTab().filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Handle file click
  const handleFileClick = (file: any) => {
    let fileType = "text"
    if (file.type === "image" || file.type === "video") {
      fileType = file.type
    }

    onFileOpen(file.name, fileType, file.content, file.path)
  }

  // Handle favorite toggle
  const handleToggleFavorite = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    toggleFileFavorite(currentUser.id, fileId)
    showNotification("File Updated", "Favorite status changed", "📌")
  }

  // Handle file delete
  const handleDeleteFile = (e: React.MouseEvent, fileId: string, fileName: string) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteUserFile(currentUser.id, fileId)
      showNotification("File Deleted", `${fileName} has been deleted`, "🗑️")
    }
  }

  // Get icon for file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return "📄"
      case "image":
        return "🖼️"
      case "video":
        return "📹"
      case "audio":
        return "🎵"
      default:
        return "📁"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <DraggableWindow
      title="My Files"
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg w-[700px] min-h-[500px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 150, y: 100 }}
    >
      <div className="window-content flex flex-col h-[500px]">
        <div className="file-header p-4 border-b border-white/20 flex justify-between items-center">
          <div className="tabs flex gap-1">
            <button
              className={`px-3 py-1 rounded-t text-sm ${activeTab === "all" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => setActiveTab("all")}
            >
              All Files
            </button>
            <button
              className={`px-3 py-1 rounded-t text-sm ${activeTab === "documents" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
            <button
              className={`px-3 py-1 rounded-t text-sm ${activeTab === "images" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => setActiveTab("images")}
            >
              Images
            </button>
            <button
              className={`px-3 py-1 rounded-t text-sm ${activeTab === "favorites" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => setActiveTab("favorites")}
            >
              Favorites
            </button>
            <button
              className={`px-3 py-1 rounded-t text-sm ${activeTab === "recent" ? "bg-white/20" : "hover:bg-white/10"}`}
              onClick={() => setActiveTab("recent")}
            >
              Recent
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 bg-black/30 border border-white/20 rounded text-sm w-[200px]"
            />
          </div>
        </div>

        <div className="file-list flex-1 overflow-y-auto p-4">
          {filteredFiles.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              {searchQuery ? "No files match your search" : "No files found in this category"}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Modified</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleFileClick(file)}
                  >
                    <td className="py-2 flex items-center gap-2">
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                      <span>{file.name}</span>
                      {file.favorite && <span className="text-yellow-400 text-xs">★</span>}
                    </td>
                    <td className="py-2 text-gray-300 capitalize">{file.type}</td>
                    <td className="py-2 text-gray-300 text-sm">{formatDate(file.lastModified)}</td>
                    <td className="py-2">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={(e) => handleToggleFavorite(e, file.id)}
                          className="text-gray-400 hover:text-yellow-400"
                          title={file.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {file.favorite ? "★" : "☆"}
                        </button>
                        <button
                          onClick={(e) => handleDeleteFile(e, file.id, file.name)}
                          className="text-gray-400 hover:text-red-400"
                          title="Delete file"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="file-footer p-3 border-t border-white/20 flex justify-between items-center text-sm text-gray-400">
          <div>{filteredFiles.length} file(s)</div>
          <div>{currentUser.username}'s Files</div>
        </div>
      </div>
    </DraggableWindow>
  )
}
