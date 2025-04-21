"use client"

import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { usernameToId } from "@/lib/user-id-mapping"

interface AppIconsProps {
  onProfileChange: (profileId: string) => void
}

export default function AppIcons({ onProfileChange }: AppIconsProps) {
  const { userProfiles, currentUser } = useUser()
  const { showNotification, playSongByUrl } = useAudio()
  const [profilePictures, setProfilePictures] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Default placeholder for missing profile pictures
  const defaultProfilePicture = "https://wallpapers.com/images/hd/blank-default-pfp-wue0zko1dfxs9z2c.jpg"
  // Default background if none is found
  const defaultBackground = "https://wallpapers.com/images/hd/windows-xp-bliss-1080p-wnxjzpfw4lljugtu.jpg"

  // Fetch all profile pictures when component mounts or refresh button is clicked
  useEffect(() => {
    fetchAllProfilePictures()

    // Set up an interval to refresh profile pictures every 5 minutes instead of 30 seconds
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing profiles (every 5 minutes)")
      setRefreshTrigger((prev) => prev + 1)
    }, 300000) // 5 minutes = 300000ms

    return () => clearInterval(intervalId)
  }, [refreshTrigger])

  const fetchAllProfilePictures = async () => {
    setLoading(true)
    console.log("Fetching profile pictures...")

    try {
      const pictures: Record<string, string> = {}
      const timestamp = new Date().getTime() // For cache busting

      // For each username in our mapping, try to get its profile picture
      for (const [username, userId] of Object.entries(usernameToId)) {
        try {
          console.log(`Fetching profile picture for ${username} (${userId})...`)

          // First try to get the profile picture URL from the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("avatar_url, profile_picture_url")
            .eq("id", userId)
            .single()

          if (profileData) {
            // Check which column exists and has a value
            const profilePicUrl = profileData.profile_picture_url || profileData.avatar_url

            if (profilePicUrl) {
              console.log(`Found profile picture URL in database for ${username}: ${profilePicUrl}`)

              // Add cache busting parameter if it doesn't already have one
              const url = profilePicUrl.includes("?") ? profilePicUrl : `${profilePicUrl}?t=${timestamp}`

              pictures[username.toLowerCase()] = url
              continue
            }
          }

          // If no URL in database, check storage directly
          console.log(`Checking storage for ${username}'s profile picture...`)

          // Try multiple possible paths
          const possiblePaths = [
            `users/${userId}`,
            `users/${userId}/profile.jpg`,
            `users/${userId}/pic.jpg`,
            userId,
            username.toLowerCase(),
          ]

          let foundImage = false

          for (const path of possiblePaths) {
            try {
              // If path includes a file name, get the public URL directly
              if (path.includes(".jpg") || path.includes(".png")) {
                const { data } = supabase.storage.from("profile-pictures").getPublicUrl(path)
                if (data?.publicUrl) {
                  pictures[username.toLowerCase()] = `${data.publicUrl}?t=${timestamp}`
                  foundImage = true
                  break
                }
              } else {
                // Otherwise list the directory
                const { data: files } = await supabase.storage.from("profile-pictures").list(path)

                if (files && files.length > 0) {
                  // Look for any image file
                  const imageFile = files.find(
                    (file) =>
                      file.name.endsWith(".jpg") ||
                      file.name.endsWith(".jpeg") ||
                      file.name.endsWith(".png") ||
                      file.name === "profile.jpg" ||
                      file.name === "pic.jpg",
                  )

                  if (imageFile) {
                    const filePath = `${path}/${imageFile.name}`
                    const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

                    if (data?.publicUrl) {
                      pictures[username.toLowerCase()] = `${data.publicUrl}?t=${timestamp}`
                      foundImage = true
                      break
                    }
                  }
                }
              }
            } catch (err) {
              console.log(`Error checking path ${path} for ${username}:`, err)
            }
          }

          if (!foundImage) {
            console.log(`No profile picture found for ${username}, using default`)
            pictures[username.toLowerCase()] = defaultProfilePicture
          }
        } catch (err) {
          console.error(`Error checking profile picture for ${username}:`, err)
          pictures[username.toLowerCase()] = defaultProfilePicture
        }
      }

      setProfilePictures(pictures)
      console.log("Finished fetching profile pictures:", pictures)
    } catch (err) {
      console.error("Error fetching profile pictures:", err)
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch background from API using the specific path format
  const fetchBackgroundFromAPI = async (userId: string, username: string) => {
    console.log(`Fetching background for ${username} (${userId}) from API...`)

    try {
      // Use the specific path format requested by the user
      const specificPath = `users/${userId}/background.png`
      console.log(`Checking specific path: ${specificPath}`)

      // Try to get the background from the specific path
      const { data } = supabase.storage.from("backgrounds").getPublicUrl(specificPath)

      if (data?.publicUrl) {
        console.log(`Found background at specific path: ${data.publicUrl}`)
        return `${data.publicUrl}?t=${Date.now()}`
      }

      // If the specific path doesn't work, try some fallbacks
      console.log("Specific path not found, trying fallbacks...")

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
            console.log(`Found background at fallback path ${path}: ${data.publicUrl}`)
            return `${data.publicUrl}?t=${Date.now()}`
          }
        } catch (err) {
          console.log(`Error checking fallback path ${path}:`, err)
        }
      }

      // If we get here, no background was found
      console.log(`No background found for ${username} in any path`)
      return null
    } catch (err) {
      console.error(`Error fetching background for ${username}:`, err)
      return null
    }
  }

  const handleIconClick = async (profileId: string, profileName: string) => {
    // Switch the active profile
    onProfileChange(profileId)

    // Show loading notification
    showNotification("Loading", `Loading ${profileName}'s profile...`, "⏳")

    // Get the user ID for this profile
    const userId = usernameToId[profileId.toLowerCase()]

    if (userId) {
      try {
        // Fetch background from API
        const backgroundUrl = await fetchBackgroundFromAPI(userId, profileName)

        if (backgroundUrl) {
          console.log(`Found background for ${profileName}: ${backgroundUrl}`)

          // Apply the background with a fade effect
          const desktopElement = document.querySelector(".desktop") as HTMLElement
          if (desktopElement) {
            // Create a temporary div for the transition
            const tempDiv = document.createElement("div")
            tempDiv.style.position = "absolute"
            tempDiv.style.top = "0"
            tempDiv.style.left = "0"
            tempDiv.style.width = "100%"
            tempDiv.style.height = "100%"
            tempDiv.style.backgroundImage = `url(${backgroundUrl})`
            tempDiv.style.backgroundSize = "cover"
            tempDiv.style.backgroundPosition = "center"
            tempDiv.style.opacity = "0"
            tempDiv.style.transition = "opacity 0.5s ease-in-out"
            tempDiv.style.zIndex = "0"

            // Add the temp div to the desktop
            desktopElement.appendChild(tempDiv)

            // Force a reflow
            void tempDiv.offsetWidth

            // Fade in the new background
            tempDiv.style.opacity = "1"

            // After transition, update the actual background and remove the temp div
            setTimeout(() => {
              desktopElement.style.backgroundImage = `url(${backgroundUrl})`
              desktopElement.style.backgroundSize = "cover"
              desktopElement.style.backgroundPosition = "center"
              desktopElement.removeChild(tempDiv)

              showNotification("Background Changed", `Background changed to match ${profileName}'s profile`, "🖼️")
            }, 500)
          } else {
            // If no desktop element, just set the background directly
            document.body.style.backgroundImage = `url(${backgroundUrl})`
            showNotification("Background Changed", `Background changed to match ${profileName}'s profile`, "🖼️")
          }
        } else {
          // No background found, use default
          console.log(`No background found for ${profileName}, using default`)

          const desktopElement = document.querySelector(".desktop") as HTMLElement
          if (desktopElement) {
            desktopElement.style.backgroundImage = `url(${defaultBackground})`
            desktopElement.style.backgroundSize = "cover"
            desktopElement.style.backgroundPosition = "center"
          }
        }
      } catch (err) {
        console.error(`Error setting background for ${profileName}:`, err)

        // Use default background on error
        const desktopElement = document.querySelector(".desktop") as HTMLElement
        if (desktopElement) {
          desktopElement.style.backgroundImage = `url(${defaultBackground})`
          desktopElement.style.backgroundSize = "cover"
          desktopElement.style.backgroundPosition = "center"
        }
      }
    }

    // Show notification
    showNotification("Profile Changed", `Switched to ${profileName}'s profile`, "👤")
  }

  // Define the specific usernames we want to display
  const specificUsernames = [
    "rtmonly",
    "n333mo",
    "slos",
    "arkham",
    "outlaw",
    "gekk",
    "lydell",
    "clipzy",
    "jack",
    "junz",
    "mocha",
    "said",
    "scorpy",
    "trystin",
  ]

  // Map app icons to user profiles with specific usernames
  const profileIcons = specificUsernames.map((username) => {
    const lowercaseUsername = username.toLowerCase()
    return {
      id: lowercaseUsername,
      profileId: lowercaseUsername,
      // Use the fetched profile picture or fall back to the default
      image: profilePictures[lowercaseUsername] || defaultProfilePicture,
      text: username,
    }
  })

  // Function to manually refresh profile pictures
  const refreshProfilePictures = () => {
    console.log("Manual refresh triggered")
    fetchAllProfilePictures()
    showNotification("Refreshing", "Refreshing profile pictures...", "🔄")
  }

  return (
    <div className="profile-dock fixed top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-lg">
      {loading ? (
        <div className="flex items-center justify-center p-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          <span className="ml-2 text-white text-sm">Loading profiles...</span>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {profileIcons.map((icon) => {
            // Check if this is the current user by comparing usernames case-insensitively
            const isCurrentUser = currentUser.username.toLowerCase() === icon.text.toLowerCase()

            return (
              <div
                key={icon.id}
                className={`profile-icon flex flex-col items-center cursor-pointer transition-all duration-200 ease-in-out ${
                  isCurrentUser ? "scale-105" : "hover:scale-110"
                }`}
                onClick={() => handleIconClick(icon.profileId, icon.text)}
              >
                <div
                  className={`profile-icon-image rounded-full overflow-hidden border-2 ${
                    isCurrentUser
                      ? "w-[60px] h-[60px] border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                      : "w-[40px] h-[40px] border-white/30"
                  } transition-all duration-300 ease-in-out hover:border-white/80 hover:shadow-lg relative`}
                >
                  <img
                    src={`${icon.image}${icon.image.includes("?") ? "&" : "?"}t=${Date.now()}`}
                    alt={icon.text}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, use the default placeholder
                      ;(e.target as HTMLImageElement).src = defaultProfilePicture
                    }}
                  />
                </div>
                <div
                  className={`profile-name text-white ${
                    isCurrentUser ? "text-sm font-medium" : "text-xs"
                  } mt-1 max-w-[60px] truncate text-center`}
                >
                  {icon.text}
                </div>
                {isCurrentUser && <div className="profile-indicator w-1 h-1 bg-white rounded-full mt-1"></div>}
              </div>
            )
          })}

          {/* Add a refresh button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              refreshProfilePictures()
            }}
            className="ml-2 p-1 bg-blue-600/50 hover:bg-blue-600/80 rounded-full"
            title="Refresh profile pictures"
          >
            🔄
          </button>
        </div>
      )}
    </div>
  )
}
