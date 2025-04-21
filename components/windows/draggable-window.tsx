"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface DraggableWindowProps {
  title: string
  onClose: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  children: React.ReactNode
  className?: string
  defaultPosition?: { x: number; y: number }
}

export default function DraggableWindow({
  title,
  onClose,
  onMinimize,
  onMaximize,
  children,
  className = "",
  defaultPosition = { x: 50, y: 50 },
}: DraggableWindowProps) {
  const [position, setPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMaximized, setIsMaximized] = useState(false)

  const windowRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Set up event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Ensure window stays within viewport
      const windowWidth = windowRef.current?.offsetWidth || 0
      const windowHeight = windowRef.current?.offsetHeight || 0
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const boundedX = Math.max(0, Math.min(newX, viewportWidth - windowWidth))
      const boundedY = Math.max(0, Math.min(newY, viewportHeight - windowHeight - 40))

      setPosition({ x: boundedX, y: boundedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = "auto"
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      // Prevent text selection while dragging
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = "auto"
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    if (e.target instanceof HTMLButtonElement) return // Don't start drag if clicking buttons

    setIsDragging(true)

    // Calculate offset from the top-left corner of the window
    const rect = windowRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    // Bring window to front by updating z-index
    if (windowRef.current) {
      const windows = document.querySelectorAll(".window, .settings-window, .music-player")
      windows.forEach((win) => {
        ;(win as HTMLElement).style.zIndex = "100"
      })
      windowRef.current.style.zIndex = "101"
    }
  }

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
    if (onMaximize) onMaximize()
  }

  return (
    <div
      ref={windowRef}
      className={`${className} absolute`}
      style={
        isMaximized
          ? { top: 0, left: 0, width: "100%", height: "calc(100% - 40px)" }
          : { top: `${position.y}px`, left: `${position.x}px` }
      }
    >
      <div
        ref={headerRef}
        className="window-header bg-[rgba(68,68,68,0.8)] p-2.5 rounded-t-lg flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="window-title font-bold">{title}</div>
        <div className="window-controls flex gap-2">
          {onMinimize && (
            <button
              className="window-button minimize w-5 h-5 rounded-full border-none cursor-pointer flex items-center justify-center text-xs text-[#333] bg-[#ffbd44]"
              onClick={onMinimize}
            >
              -
            </button>
          )}

          <button
            className="window-button maximize w-5 h-5 rounded-full border-none cursor-pointer flex items-center justify-center text-xs text-[#333] bg-[#00ca4e]"
            onClick={handleMaximize}
          >
            □
          </button>

          <button
            className="window-button close w-5 h-5 rounded-full border-none cursor-pointer flex items-center justify-center text-xs text-[#333] bg-[#ff605c]"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
