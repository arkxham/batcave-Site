"use client"

import { useEffect, useRef } from "react"
import { useAudio } from "@/context/audio-context"

interface VideoViewerProps {
  fileName: string
  videoUrl: string
  onClose: () => void
}

export default function VideoViewer({ fileName, videoUrl, onClose }: VideoViewerProps) {
  const { isPlaying, pauseSong, resumeSong } = useAudio()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Pause music when video starts
    if (isPlaying) {
      pauseSong()
    }

    // Play video
    if (videoRef.current) {
      videoRef.current.play().catch((err) => console.error("Video play error:", err))
    }

    return () => {
      // Resume music when component unmounts
      if (isPlaying) {
        resumeSong()
      }
    }
  }, [])

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    onClose()
  }

  return (
    <div className="video-viewer fixed top-0 left-0 w-full h-full bg-black/90 flex justify-center items-center z-[2000] flex-col">
      <button
        className="close-video absolute top-5 right-5 text-white bg-black/50 border-none w-10 h-10 rounded-full text-xl cursor-pointer flex items-center justify-center"
        onClick={handleClose}
      >
        &times;
      </button>

      <div className="video-container relative max-w-[90%] max-h-[80%]">
        <video
          ref={videoRef}
          src={videoUrl || `Photos/${fileName}`}
          className="max-w-full max-h-[80vh] object-contain border-2 border-[#444] shadow-lg"
          controls
        />
      </div>

      <div className="video-title text-white mt-5 text-lg">{fileName}</div>
    </div>
  )
}
