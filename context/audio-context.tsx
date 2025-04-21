"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@/context/user-context"

interface Song {
  title: string
  artist: string
  file: string
  thumbnail?: string
}

interface Notification {
  id: string
  title: string
  message: string
  icon: string
}

interface AudioContextType {
  songs: Song[]
  currentSongIndex: number
  isPlaying: boolean
  volume: number
  isShuffleOn: boolean
  isRepeatOn: boolean
  currentSong: Song | null
  notifications: Notification[]
  fileContents: Record<string, string>
  setCurrentSongIndex: (index: number) => void
  setVolume: (volume: number) => void
  playSong: () => void
  pauseSong: () => void
  resumeSong: () => void
  playNextSong: () => void
  playPrevSong: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  showNotification: (title: string, message: string, icon: string) => void
  removeNotification: (id: string) => void
  playSongByUrl: (url: string, profileName: string) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser()

  const [songs, setSongs] = useState<Song[]>([
    {
      title: "On Melancholy Hill",
      artist: "Gorillaz",
      file: "songs/song1.mp3",
      thumbnail: "Thumbnails/Melachony.png",
    },
    {
      title: "13 nuyork nights at 21",
      artist: "Uzi Vert",
      file: "songs/song2.mp3",
      thumbnail: "Thumbnails/nuyrok.jpg",
    },
    {
      title: "Forest Theme",
      artist: "Nature Sounds",
      file: "songs/song3.mp3",
      thumbnail: "Thumbnails/forest.jpg",
    },
    {
      title: "Gotham City",
      artist: "Dark Knight",
      file: "songs/song4.mp3",
      thumbnail: "Thumbnails/gotham.jpg",
    },
    {
      title: "Randal's Theme",
      artist: "Unknown",
      file: "songs/song5.mp3",
      thumbnail: "Thumbnails/randal.jpg",
    },
    {
      title: "Hat Trick",
      artist: "Protect",
      file: "songs/song6.mp3",
      thumbnail: "Thumbnails/HT.png",
    },
    {
      title: "OPM BABI",
      artist: "Playboi Carti",
      file: "songs/song7.mp3",
      thumbnail: "Thumbnails/OB.png",
    },
    {
      title: "If It Aint Wok",
      artist: "Lucki",
      file: "songs/song8.mp3",
      thumbnail: "Thumbnails/IFAW.jpg",
    },
    {
      title: "Zebra Stripes",
      artist: "Wild Life",
      file: "songs/song9.mp3",
      thumbnail: "Thumbnails/zebra.jpg",
    },
    {
      title: "Los Save Us",
      artist: "Savior",
      file: "songs/song10.mp3",
      thumbnail: "Thumbnails/lossave.jpg",
    },
    {
      title: "Blatt Beat",
      artist: "Blatt",
      file: "songs/song11.mp3",
      thumbnail: "Thumbnails/blatt.jpg",
    },
  ])

  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isShuffleOn, setIsShuffleOn] = useState(false)
  const [isRepeatOn, setIsRepeatOn] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [customSong, setCustomSong] = useState<Song | null>(null)

  // File contents for text files
  const fileContents: Record<string, string> = {
    "secret_plans.txt":
      "Top Secret Batman Plans:\n\n1. Upgrade Batmobile with new stealth technology\n2. Develop antidote for Joker's latest toxin\n3. Install additional security measures in the Batcave\n4. Schedule meeting with Commissioner Gordon\n5. Investigate suspicious activity at Gotham Harbor",
    "Plans To Kill Lydell.doc":
      "Operation Takedown:\n\n- Monitor Lydell's daily routine\n- Identify vulnerabilities in security detail\n- Prepare non-lethal neutralization methods\n-Coordinate with Gordon for proper arrest procedures\n- Ensure all evidence is properly documented for prosecution",
    "Credits.txt": "Made by: @80dropz \n \n \n ",
  }

  // Audio element reference
  let audioElement: HTMLAudioElement | null = null

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (typeof window !== "undefined") {
      audioElement = document.getElementById("audioPlayer") as HTMLAudioElement

      if (!audioElement) {
        audioElement = document.createElement("audio")
        audioElement.id = "audioPlayer"
        document.body.appendChild(audioElement)
      }

      // Set initial volume
      audioElement.volume = volume / 100

      // Add event listeners
      audioElement.addEventListener("ended", handleSongEnd)
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("ended", handleSongEnd)
      }
    }
  }, [])

  // Update song when user changes
  useEffect(() => {
    if (currentUser) {
      // Find user's custom song
      const customSong = currentUser.customSong
      if (customSong) {
        // Find if song already exists in the list
        const songIndex = songs.findIndex((song) => song.file === customSong.file)

        if (songIndex !== -1) {
          setCurrentSongIndex(songIndex)
        } else {
          // Add the song to the list
          setSongs((prev) => [...prev, customSong])
          setCurrentSongIndex(songs.length)
        }

        // Load and play the song
        loadAndPlaySong()
      }
    }
  }, [currentUser])

  const handleSongEnd = () => {
    if (isRepeatOn) {
      // Replay the current song
      if (audioElement) {
        audioElement.currentTime = 0
        audioElement.play()
      }
    } else if (isShuffleOn) {
      // Play a random song
      playRandomSong()
    } else if (currentSongIndex < songs.length - 1) {
      // Play the next song
      setCurrentSongIndex(currentSongIndex + 1)
      loadAndPlaySong()
    } else {
      // End of playlist
      setIsPlaying(false)
    }
  }

  const loadAndPlaySong = () => {
    if (audioElement && songs[currentSongIndex]) {
      audioElement.src = songs[currentSongIndex].file
      audioElement.load()
      audioElement
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((err) => {
          console.error("Error playing audio:", err)
          setIsPlaying(false)
        })
    }
  }

  const playSong = () => {
    if (audioElement) {
      if (audioElement.src) {
        audioElement
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.error("Error playing audio:", err)
          })
      } else if (songs.length > 0) {
        loadAndPlaySong()
      }
    }
  }

  const pauseSong = () => {
    if (audioElement) {
      audioElement.pause()
      setIsPlaying(false)
    }
  }

  const resumeSong = () => {
    if (audioElement) {
      audioElement
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((err) => {
          console.error("Error resuming audio:", err)
        })
    }
  }

  const playNextSong = () => {
    if (isShuffleOn) {
      playRandomSong()
    } else {
      setCurrentSongIndex((currentSongIndex + 1) % songs.length)
      loadAndPlaySong()
    }
  }

  const playPrevSong = () => {
    if (audioElement && audioElement.currentTime > 3) {
      audioElement.currentTime = 0
    } else {
      setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length)
      loadAndPlaySong()
    }
  }

  const playRandomSong = () => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * songs.length)
    } while (newIndex === currentSongIndex && songs.length > 1)

    setCurrentSongIndex(newIndex)
    loadAndPlaySong()
  }

  // New function to play a song by URL
  const playSongByUrl = (url: string, profileName: string) => {
    if (audioElement) {
      // Pause current song if playing
      if (isPlaying) {
        audioElement.pause()
      }

      // Set the new song URL
      audioElement.src = url
      audioElement.load()

      // Play the new song
      audioElement
        .play()
        .then(() => {
          setIsPlaying(true)
          setCustomSong({
            title: `${profileName}'s Theme`,
            artist: profileName,
            file: url,
            thumbnail: `/Photos/app${Math.floor(Math.random() * 11) + 1}.jpg`,
          })
          showNotification("Now Playing", `${profileName}'s theme song`, "🎵")
        })
        .catch((err) => {
          console.error("Error playing audio:", err)
          showNotification("Playback Error", `Could not play ${profileName}'s theme song`, "❌")
        })
    }
  }

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn)
  }

  const toggleRepeat = () => {
    setIsRepeatOn(!isRepeatOn)
    if (audioElement) {
      audioElement.loop = !isRepeatOn
    }
  }

  const showNotification = (title: string, message: string, icon: string) => {
    const id = Date.now().toString()
    const notification = { id, title, message, icon }

    setNotifications((prev) => [...prev, notification])

    // Auto-remove after 1.5 seconds (changed from 5 seconds)
    setTimeout(() => {
      removeNotification(id)
    }, 1500)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const value = {
    songs,
    currentSongIndex,
    isPlaying,
    volume,
    isShuffleOn,
    isRepeatOn,
    currentSong: customSong || songs[currentSongIndex] || null,
    notifications,
    fileContents,
    setCurrentSongIndex,
    setVolume,
    playSong,
    pauseSong,
    resumeSong,
    playNextSong,
    playPrevSong,
    toggleShuffle,
    toggleRepeat,
    showNotification,
    removeNotification,
    playSongByUrl,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
