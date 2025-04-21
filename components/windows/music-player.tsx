"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAudio } from "@/context/audio-context"
import DraggableWindow from "@/components/windows/draggable-window"

interface MusicPlayerProps {
  onClose: () => void
}

export default function MusicPlayer({ onClose }: MusicPlayerProps) {
  const {
    songs,
    currentSongIndex,
    isPlaying,
    volume,
    setVolume,
    playSong,
    pauseSong,
    playNextSong,
    playPrevSong,
    setCurrentSongIndex,
    toggleShuffle,
    toggleRepeat,
    isShuffleOn,
    isRepeatOn,
  } = useAudio()

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Get audio element from context
    audioRef.current = document.getElementById("audioPlayer") as HTMLAudioElement

    const updateProgress = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
        setDuration(audioRef.current.duration || 0)
        setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100)
      }
    }

    const audioElement = audioRef.current
    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateProgress)
      audioElement.addEventListener("loadedmetadata", updateProgress)
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("timeupdate", updateProgress)
        audioElement.removeEventListener("loadedmetadata", updateProgress)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !audioRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = clickPosition * (audioRef.current.duration || 0)

    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value)
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  return (
    <DraggableWindow
      title="Music Player"
      onClose={onClose}
      className="music-player w-[600px] h-[500px] bg-[rgba(18,18,18,0.95)] rounded-lg shadow-lg text-white z-100 overflow-hidden"
      defaultPosition={{ x: 150, y: 80 }}
    >
      <div className="music-player-content p-0 flex flex-col h-[calc(100%-50px)]">
        <div className="song-list flex-1 overflow-y-auto p-2.5">
          {songs.map((song, index) => (
            <div
              key={index}
              className={`song-item p-2.5 rounded cursor-pointer transition-colors flex items-center gap-4 mb-2 ${index === currentSongIndex ? "bg-[rgba(30,215,96,0.2)]" : "hover:bg-white/10"}`}
              onClick={() => setCurrentSongIndex(index)}
            >
              <img
                src={song.thumbnail || "/Photos/default-music.jpg"}
                className="song-thumbnail w-[60px] h-[60px] rounded object-cover"
                alt={song.title}
              />
              <div className="song-info flex-1 whitespace-normal overflow-visible">
                <div className="song-title text-base font-medium mb-1 text-white">{song.title}</div>
                <div className="song-artist text-sm text-[#b3b3b3]">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="player-footer bg-[rgba(24,24,24,0.9)] p-4 border-t border-[#333]">
          <div className="now-playing flex items-center gap-2.5 mb-2.5">
            <img
              id="nowPlayingThumbnail"
              src={songs[currentSongIndex]?.thumbnail || "/Photos/default-music.jpg"}
              className="now-playing-thumbnail w-14 h-14 rounded object-cover"
              alt="Now Playing"
            />
            <div className="now-playing-info flex-1">
              <div className="now-playing-title text-sm font-medium text-white" id="nowPlayingTitle">
                {songs[currentSongIndex]?.title || "No song selected"}
              </div>
              <div className="now-playing-artist text-xs text-[#b3b3b3]" id="nowPlayingArtist">
                {songs[currentSongIndex]?.artist || ""}
              </div>
            </div>
          </div>

          <div className="progress-time flex justify-between text-xs text-[#b3b3b3] mb-2.5">
            <span id="currentTime">{formatTime(currentTime)}</span>
            <span id="totalTime">{formatTime(duration)}</span>
          </div>

          <div
            className="progress-container w-full h-1 bg-[#535353] rounded mb-2.5 cursor-pointer relative"
            id="progressContainer"
            ref={progressRef}
            onClick={handleProgressClick}
          >
            <div
              className="progress-bar h-full bg-[#1DB954] rounded"
              id="progressBar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="player-controls flex justify-center items-center gap-5">
            <button
              className={`control-button bg-transparent border-none ${isShuffleOn ? "text-[#1DB954]" : "text-[#b3b3b3]"} w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-base transition-all hover:text-white`}
              id="shuffleButton"
              onClick={toggleShuffle}
            >
              🔀
            </button>
            <button
              className="control-button bg-transparent border-none text-[#b3b3b3] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-base transition-all hover:text-white"
              id="prevButton"
              onClick={playPrevSong}
            >
              ⏮
            </button>
            <button
              className="control-button play-button bg-white text-black w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-lg transition-all hover:scale-105"
              id="playButton"
              onClick={isPlaying ? pauseSong : playSong}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              className="control-button bg-transparent border-none text-[#b3b3b3] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-base transition-all hover:text-white"
              id="nextButton"
              onClick={playNextSong}
            >
              ⏭
            </button>
            <button
              className={`control-button bg-transparent border-none ${isRepeatOn ? "text-[#1DB954]" : "text-[#b3b3b3]"} w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-base transition-all hover:text-white`}
              id="repeatButton"
              onClick={toggleRepeat}
            >
              🔁
            </button>
            <div className="volume-control flex items-center gap-2 ml-2.5">
              <span className="volume-icon text-[#b3b3b3] text-sm">
                {volume === 0 ? "🔇" : volume < 50 ? "🔈" : "🔊"}
              </span>
              <input
                type="range"
                className="volume-slider w-20 h-1 bg-[#535353] rounded appearance-none cursor-pointer outline-none"
                id="musicVolumeSlider"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </DraggableWindow>
  )
}
