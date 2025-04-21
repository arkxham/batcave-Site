"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"
import Taskbar from "@/components/taskbar"
import AppIcons from "@/components/app-icons"
import SocialButtons from "@/components/social-buttons"
import DesktopIcons from "@/components/desktop-icons"
import StartMenu from "@/components/start-menu"
import NotificationCenter from "@/components/notification-center"
import SettingsWindow from "@/components/windows/settings-window"
import DocumentsWindow from "@/components/windows/documents-window"
import PicturesWindow from "@/components/windows/pictures-window"
import MusicPlayer from "@/components/windows/music-player"
import ImageViewer from "@/components/viewers/image-viewer"
import VideoViewer from "@/components/viewers/video-viewer"
import TextEditor from "@/components/editors/text-editor"
import WelcomeOverlay from "@/components/welcome-overlay"
import DirectoryWindow from "@/components/windows/directory-window"
import ProfilesWindow from "@/components/windows/profiles-window"
import PhotosDirectoryWindow from "@/components/windows/photos-directory-window"
import MusicDirectoryWindow from "@/components/windows/music-directory-window"
import UserProfileWindow from "@/components/windows/user-profile-window"
import UserPreferencesWindow from "@/components/windows/user-preferences-window"
import UserFilesWindow from "@/components/windows/user-files-window"
import AdminWindow from "@/components/windows/admin-window"
import DesktopInfo from "@/components/desktop-info"
import UserProfileViewer from "@/components/windows/user-profile-viewer"
import { supabase } from "@/lib/supabase-client"
import { usernameToId } from "@/lib/user-id-mapping"

interface DesktopProps {
  onLogout: () => void
}

export default function Desktop({ onLogout }: DesktopProps) {
  const { currentUser, setCurrentUser } = useUser()
  const { showNotification, playSongByUrl } = useAudio()
  const [background, setBackground] = useState(currentUser.backgroundImage)
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [activeWindows, setActiveWindows] = useState<{
    [key: string]: boolean
  }>({
    settings: false,
    documents: false,
    pictures: false,
    music: false,
    imageViewer: false,
    videoViewer: false,
    textEditor: false,
    directory: false,
    profiles: false,
    photosDirectory: false,
    musicDirectory: false,
    userProfile: false,
    userPreferences: false,
    userFiles: false,
    admin: false,
    userProfileViewer: false,
  })

  // Current file being viewed/edited
  const [currentFile, setCurrentFile] = useState<{
    name: string
    type: string
    content?: string
    url?: string
  } | null>(null)

  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string | undefined>(undefined)

  // Cache for background images and songs
  const [backgroundCache, setBackgroundCache] = useState<Record<string, string>>({})
  const [songCache, setSongCache] = useState<Record<string, string>>({})

  // Add a timestamp for cache busting
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now())

  // Fetch backgrounds and songs once on component mount
  useEffect(() => {
    fetchBackgroundsAndSongs()
  }, [])

  // Add this function to refresh the cache timestamp
  const refreshCacheTimestamp = () => {
    setCacheTimestamp(Date.now())
  }

  const fetchBackgroundsAndSongs = async () => {
    const backgrounds: Record<string, string> = {}
    const songs: Record<string, string> = {}
    const timestamp = Date.now() // For cache busting

    for (const [username, userId] of Object.entries(usernameToId)) {
      try {
        // Check if background exists using the specific path format
        const specificPath = `users/${userId}/background.png`
        const { data } = supabase.storage.from("backgrounds").getPublicUrl(specificPath)

        if (data?.publicUrl) {
          // Add cache busting parameter
          backgrounds[username.toLowerCase()] = `${data.publicUrl}?t=${timestamp}`
        } else {
          // Try fallback paths
          const fallbackPaths = [
            `users/${userId}/background.jpg`,
            `users/${userId}/pic.png`,
            `users/${userId}/pic.jpg`,
            `${userId}/background.png`,
            `${userId}/background.jpg`,
          ]

          for (const path of fallbackPaths) {
            try {
              const { data } = supabase.storage.from("backgrounds").getPublicUrl(path)
              if (data?.publicUrl) {
                backgrounds[username.toLowerCase()] = `${data.publicUrl}?t=${timestamp}`
                break
              }
            } catch (err) {
              // Continue to next path
            }
          }
        }

        // Check if song exists
        const { data: songExists } = await supabase.storage.from("songs").list(`users/${userId}`, {
          limit: 1,
          search: "background-song.mp3",
        })

        if (songExists && songExists.length > 0) {
          const { data } = supabase.storage.from("songs").getPublicUrl(`users/${userId}/background-song.mp3`)

          if (data?.publicUrl) {
            // Add cache busting parameter
            songs[username.toLowerCase()] = `${data.publicUrl}?t=${timestamp}`
          }
        }
      } catch (err) {
        console.error(`Error fetching assets for ${username}:`, err)
      }
    }

    setBackgroundCache(backgrounds)
    setSongCache(songs)
  }

  useEffect(() => {
    // Show welcome notification
    showNotification("Welcome", `Welcome to ${currentUser.username}'s Desktop`, "👋")

    // Hide welcome overlay after 2 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Update background when user changes
  useEffect(() => {
    if (currentUser) {
      // Set background based on user profile
      setBackground(currentUser.backgroundImage)
      console.log("Current user changed to:", currentUser.username)
      console.log("Setting background to:", currentUser.backgroundImage)
    }
  }, [currentUser])

  const toggleWindow = (windowName: string, show?: boolean) => {
    setActiveWindows((prev) => ({
      ...prev,
      [windowName]: show !== undefined ? show : !prev[windowName],
    }))

    // If opening a window, bring it to front
    if (show !== false) {
      // Reset all window z-indices
      const windows = document.querySelectorAll(".window, .settings-window, .music-player")
      windows.forEach((win) => {
        ;(win as HTMLElement).style.zIndex = "100"
      })

      // Set the target window to front
      setTimeout(() => {
        const targetWindow = document.querySelector(
          `.${windowName === "settings" ? "settings-window" : windowName === "music" ? "music-player" : "window"}`,
        )
        if (targetWindow) {
          ;(targetWindow as HTMLElement).style.zIndex = "101"
        }
      }, 10)
    }
  }

  const handleBackgroundChange = (newBackground: string) => {
    setBackground(newBackground)
  }

  const handleProfileChange = async (profileId: string) => {
    console.log("Profile change requested:", profileId)

    // Update the current user
    setCurrentUser(profileId)

    // Refresh cache timestamp to force reload of assets
    refreshCacheTimestamp()

    // Fetch background for this profile
    try {
      const userId = usernameToId[profileId.toLowerCase()]
      if (userId) {
        console.log(`Fetching background for ${profileId} (${userId})...`)

        // Try multiple possible paths for backgrounds
        const possiblePaths = [
          `${userId}`,
          `${userId}/background.jpg`,
          `users/${userId}`,
          `users/${userId}/background.jpg`,
          profileId.toLowerCase(),
        ]

        let backgroundUrl = null

        for (const path of possiblePaths) {
          try {
            // If path includes a file name, get the public URL directly
            if (path.includes(".jpg") || path.includes(".png")) {
              const { data } = supabase.storage.from("backgrounds").getPublicUrl(path)
              if (data?.publicUrl) {
                backgroundUrl = `${data.publicUrl}?t=${Date.now()}`
                break
              }
            } else {
              // Otherwise list the directory
              const { data: files } = await supabase.storage.from("backgrounds").list(path)

              if (files && files.length > 0) {
                // Look for any image file
                const imageFile = files.find(
                  (file) => file.name.endsWith(".jpg") || file.name.endsWith(".png") || file.name === "background.jpg",
                )

                if (imageFile) {
                  const filePath = `${path}/${imageFile.name}`
                  const { data } = supabase.storage.from("backgrounds").getPublicUrl(filePath)

                  if (data?.publicUrl) {
                    backgroundUrl = `${data.publicUrl}?t=${Date.now()}`
                    break
                  }
                }
              }
            }
          } catch (err) {
            console.log(`Error checking background path ${path}:`, err)
          }
        }

        if (backgroundUrl) {
          console.log("Setting background to:", backgroundUrl)
          setBackground(backgroundUrl)
        } else {
          // Use cached background if available
          const lowercaseProfileId = profileId.toLowerCase()
          if (backgroundCache[lowercaseProfileId]) {
            console.log("Using cached background:", backgroundCache[lowercaseProfileId])
            setBackground(backgroundCache[lowercaseProfileId])
          }
        }

        // Use cached song if available
        if (songCache[profileId.toLowerCase()]) {
          playSongByUrl(songCache[profileId.toLowerCase()], profileId)
        }
      }
    } catch (err) {
      console.error(`Error setting background for ${profileId}:`, err)
    }

    // Update the Profiles window if it's open
    if (activeWindows.profiles) {
      toggleWindow("profiles", false)
      setTimeout(() => toggleWindow("profiles", true), 100)
    }

    // Force a re-render of the taskbar
    const taskbar = document.querySelector(".taskbar")
    if (taskbar) {
      taskbar.classList.add("force-update")
      setTimeout(() => taskbar.classList.remove("force-update"), 10)
    }
  }

  const handleFileOpen = (fileName: string, fileType: string, content?: string, url?: string) => {
    setCurrentFile({
      name: fileName,
      type: fileType,
      content,
      url,
    })

    if (fileType === "image") {
      toggleWindow("imageViewer", true)
    } else if (fileType === "video") {
      toggleWindow("videoViewer", true)
    } else if (fileType === "text") {
      toggleWindow("textEditor", true)
    }
  }

  const handleStartButtonClick = () => {
    setShowStartMenu(!showStartMenu)
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    // Close start menu when clicking outside
    if (
      showStartMenu &&
      !(e.target as HTMLElement).closest("#startMenu") &&
      !(e.target as HTMLElement).closest("#startButton")
    ) {
      setShowStartMenu(false)
    }
  }

  const handleOpenSubDirectory = (directory: string) => {
    if (directory === "profiles") {
      toggleWindow("profiles", true)
    } else if (directory === "photos") {
      toggleWindow("photosDirectory", true)
    } else if (directory === "music") {
      toggleWindow("musicDirectory", true)
    }
  }

  const handleProfileSelect = (profileId: string) => {
    handleProfileChange(profileId)
    toggleWindow("profiles", false)
  }

  const handlePhotoSelect = (photoUrl: string, photoName: string) => {
    setBackground(photoUrl)
    showNotification("Background Changed", `Background changed to ${photoName}`, "🖼️")
  }

  const handleViewProfile = (username: string) => {
    setSelectedProfileUsername(username)
    toggleWindow("userProfileViewer", true)
  }

  return (
    <div
      className="desktop w-full h-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${background}${background.includes("?") ? "&" : "?"}t=${cacheTimestamp})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      onClick={handleClickOutside}
    >
      <div className="desktop-overlay absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 pointer-events-none"></div>

      {showWelcome && <WelcomeOverlay />}

      <AppIcons onProfileChange={handleProfileChange} />

      <DesktopInfo currentUser={currentUser} />

      <SocialButtons />

      <DesktopIcons
        onFolderOpen={(folder) => toggleWindow(folder, true)}
        onSettingsOpen={() => toggleWindow("settings", true)}
        onDirectoryOpen={() => toggleWindow("directory", true)}
        onProfilesOpen={() => toggleWindow("profiles", true)}
        onAdminOpen={() => toggleWindow("admin", true)}
      />

      {showStartMenu && (
        <StartMenu
          onItemClick={(item) => {
            if (item === "power") {
              if (confirm("Are you sure you want to log out?")) {
                onLogout()
              }
            } else if (item === "settings") {
              toggleWindow("settings", true)
            } else if (item === "music") {
              toggleWindow("music", true)
            } else if (item === "directory") {
              toggleWindow("directory", true)
            } else if (item === "userProfile") {
              toggleWindow("userProfile", true)
            } else if (item === "userPreferences") {
              toggleWindow("userPreferences", true)
            } else if (item === "userFiles") {
              toggleWindow("userFiles", true)
            } else if (item === "admin") {
              toggleWindow("admin", true)
            } else {
              toggleWindow(item, true)
            }
            setShowStartMenu(false)
          }}
        />
      )}

      <NotificationCenter />

      {activeWindows.settings && (
        <SettingsWindow
          onClose={() => toggleWindow("settings", false)}
          onBackgroundChange={handleBackgroundChange}
          currentBackground={background}
        />
      )}

      {activeWindows.documents && (
        <DocumentsWindow onClose={() => toggleWindow("documents", false)} onFileOpen={handleFileOpen} />
      )}

      {activeWindows.pictures && (
        <PicturesWindow onClose={() => toggleWindow("pictures", false)} onFileOpen={handleFileOpen} />
      )}

      {activeWindows.music && <MusicPlayer onClose={() => toggleWindow("music", false)} />}

      {activeWindows.directory && (
        <DirectoryWindow onClose={() => toggleWindow("directory", false)} onOpenSubDirectory={handleOpenSubDirectory} />
      )}

      {activeWindows.profiles && (
        <ProfilesWindow
          onClose={() => toggleWindow("profiles", false)}
          onProfileSelect={handleProfileSelect}
          onViewProfile={handleViewProfile}
        />
      )}

      {activeWindows.photosDirectory && (
        <PhotosDirectoryWindow
          onClose={() => toggleWindow("photosDirectory", false)}
          onPhotoSelect={handlePhotoSelect}
        />
      )}

      {activeWindows.musicDirectory && <MusicDirectoryWindow onClose={() => toggleWindow("musicDirectory", false)} />}

      {activeWindows.userProfile && <UserProfileWindow onClose={() => toggleWindow("userProfile", false)} />}

      {activeWindows.userPreferences && (
        <UserPreferencesWindow onClose={() => toggleWindow("userPreferences", false)} />
      )}

      {activeWindows.userFiles && (
        <UserFilesWindow onClose={() => toggleWindow("userFiles", false)} onFileOpen={handleFileOpen} />
      )}

      {activeWindows.admin && <AdminWindow onClose={() => toggleWindow("admin", false)} />}

      {activeWindows.imageViewer && currentFile && currentFile.type === "image" && (
        <ImageViewer
          fileName={currentFile.name}
          imageUrl={`${currentFile.url || ""}${currentFile.url?.includes("?") ? "&" : "?"}t=${cacheTimestamp}`}
          onClose={() => toggleWindow("imageViewer", false)}
        />
      )}

      {activeWindows.videoViewer && currentFile && currentFile.type === "video" && (
        <VideoViewer
          fileName={currentFile.name}
          videoUrl={currentFile.url || ""}
          onClose={() => toggleWindow("videoViewer", false)}
        />
      )}

      {activeWindows.textEditor && currentFile && currentFile.type === "text" && (
        <TextEditor
          fileName={currentFile.name}
          content={currentFile.content || ""}
          onClose={() => toggleWindow("textEditor", false)}
          onSave={(content) => {
            showNotification("File Saved", `${currentFile.name} has been saved`, "💾")
            toggleWindow("textEditor", false)
          }}
        />
      )}

      {activeWindows.userProfileViewer && (
        <UserProfileViewer
          onClose={() => toggleWindow("userProfileViewer", false)}
          username={selectedProfileUsername}
          key={`profile-viewer-${selectedProfileUsername}-${cacheTimestamp}`}
        />
      )}

      <Taskbar
        onStartButtonClick={handleStartButtonClick}
        onMusicPlayerClick={() => toggleWindow("music", true)}
        key={`taskbar-${currentUser.id}-${cacheTimestamp}`} // Force re-render when user changes
      />
    </div>
  )
}
