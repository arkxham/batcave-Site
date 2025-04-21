"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import DraggableWindow from "@/components/windows/draggable-window"
import { supabase } from "@/lib/supabase-client"
import { useUser } from "@/context/user-context"
import { useAudio } from "@/context/audio-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface AdminWindowProps {
  onClose: () => void
}

interface UserFile {
  name: string
  publicUrl: string
  path: string
  bucket: string
}

interface UserFiles {
  "profile-pictures": UserFile[]
  backgrounds: UserFile[]
  songs: UserFile[]
  twitter: UserFile[]
  twitch: UserFile[]
  github: UserFile[]
  steam: UserFile[]
  [key: string]: UserFile[]
}

export default function AdminWindow({ onClose }: AdminWindowProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [background, setBackground] = useState<File | null>(null)
  const [backgroundSong, setBackgroundSong] = useState<File | null>(null)
  const [twitterImage, setTwitterImage] = useState<File | null>(null)
  const [twitchImage, setTwitchImage] = useState<File | null>(null)
  const [githubImage, setGithubImage] = useState<File | null>(null)
  const [steamImage, setSteamImage] = useState<File | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [userFiles, setUserFiles] = useState<UserFiles | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({
    profilePicture: 0,
    background: 0,
    backgroundSong: 0,
    twitter: 0,
    twitch: 0,
    github: 0,
    steam: 0,
  })
  const [socialLinks, setSocialLinks] = useState({
    twitter_url: "",
    twitch_url: "",
    github_url: "",
    steam_url: "",
  })

  // Add these state variables after the other state declarations
  const [fixingUploads, setFixingUploads] = useState(false)
  const [fixUploadResult, setFixUploadResult] = useState<any>(null)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [runningEmergencyFix, setRunningEmergencyFix] = useState(false)
  const [uploadDebugInfo, setUploadDebugInfo] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  const { currentUser, updateUserProfile } = useUser()
  const { showNotification } = useAudio()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true)
        fetchUserProfile(session.user.id)
      }
    }

    checkSession()
  }, [])

  // Add this function to fetch user files
  const fetchUserFiles = async (userId: string) => {
    setLoadingFiles(true)
    try {
      const response = await fetch("/api/get-user-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          adminKey: process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch user files")
      }

      const data = await response.json()
      setUserFiles(data.files)
    } catch (error: any) {
      console.error("Error fetching user files:", error.message)
      showNotification("Error", `Failed to fetch user files: ${error.message}`, "❌")
    } finally {
      setLoadingFiles(false)
    }
  }

  // Add this function after fetchUserProfile
  const createUserFolders = async (userId: string) => {
    try {
      const response = await fetch("/api/create-user-folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          adminKey: process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user folders")
      }

      return true
    } catch (error: any) {
      console.error("Error creating user folders:", error.message)
      return false
    }
  }

  // Update the fetchUserProfile function to create user folders and fetch files
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) throw error

      if (data) {
        setProfileData(data)
        setSocialLinks({
          twitter_url: data.twitter_url || "",
          twitch_url: data.twitch_url || "",
          github_url: data.github_url || "",
          steam_url: data.steam_url || "",
        })

        // Create user folders when profile is fetched
        await createUserFolders(userId)

        // Fetch user files
        await fetchUserFiles(userId)
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message)
      showNotification("Error", "Failed to fetch profile data", "❌")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) throw error

      if (data.user) {
        setIsLoggedIn(true)
        fetchUserProfile(data.user.id)
        showNotification("Login Successful", "You've successfully logged in", "👋")
      }
    } catch (error: any) {
      setError(error.message)
      showNotification("Login Failed", error.message, "❌")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setProfileData(null)
    setUserFiles(null)
    setEmail("")
    setPassword("")
    showNotification("Logged Out", "You have been logged out", "👋")
  }

  // Add this function to delete a file
  const deleteFile = async (bucket: string, filePath: string) => {
    try {
      const response = await fetch("/api/delete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucket,
          filePath,
          adminKey: process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete file")
      }

      return true
    } catch (error: any) {
      console.error("Error deleting file:", error.message)
      return false
    }
  }

  // Update the profilePictureDropzone configuration to only accept JPG files
  const profilePictureDropzone = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setProfilePicture(acceptedFiles[0])
    },
  })

  // Update the backgroundDropzone configuration to only accept PNG files
  const backgroundDropzone = useDropzone({
    accept: {
      "image/png": [".png"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setBackground(acceptedFiles[0])
    },
  })

  const backgroundSongDropzone = useDropzone({
    accept: {
      "audio/mpeg": [".mp3"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setBackgroundSong(acceptedFiles[0])
    },
  })

  const twitterDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setTwitterImage(acceptedFiles[0])
    },
  })

  const twitchDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setTwitchImage(acceptedFiles[0])
    },
  })

  const githubDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setGithubImage(acceptedFiles[0])
    },
  })

  const steamDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setSteamImage(acceptedFiles[0])
    },
  })

  const handleSocialLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSocialLinks((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Create a text file with the link and upload it to the corresponding bucket
    if (value) {
      const socialType = name.split("_")[0] // Extract 'twitter', 'github', etc.
      const textContent = value
      const blob = new Blob([textContent], { type: "text/plain" })
      const file = new File([blob], "file.txt", { type: "text/plain" })

      // Upload the text file to the corresponding bucket
      if (profileData && profileData.id) {
        await uploadFileServerSide(file, socialType, socialType)
      }
    }
  }

  const getUsernameFromEmail = (email: string) => {
    return email.split("@")[0]
  }

  // Add this function before the handleSaveProfile function
  const handleFixUploads = async () => {
    setFixingUploads(true)
    setFixUploadResult(null)

    try {
      // Use the new simpler API route that just makes buckets public
      const response = await fetch("/api/make-buckets-public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey: process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix uploads")
      }

      setFixUploadResult({
        results: data.results,
      })

      showNotification("Upload Fix Applied", "Storage buckets have been made public. Try uploading again.", "✅")
    } catch (error: any) {
      console.error("Error fixing uploads:", error.message)
      setFixUploadResult({ error: error.message })
      showNotification("Fix Failed", `Failed to fix uploads: ${error.message}`, "❌")
    } finally {
      setFixingUploads(false)
    }
  }

  // Add this new function for the emergency fix
  const handleEmergencyFix = async () => {
    setRunningEmergencyFix(true)
    setFixUploadResult(null)

    try {
      const response = await fetch("/api/emergency-bucket-fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey: process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply emergency fix")
      }

      setFixUploadResult({
        results: data.results,
      })

      showNotification(
        "Emergency Fix Applied",
        "Storage buckets have been created and RLS has been disabled. Try uploading again.",
        "✅",
      )
    } catch (error: any) {
      console.error("Error applying emergency fix:", error.message)
      setFixUploadResult({ error: error.message })
      showNotification("Emergency Fix Failed", `Failed to apply emergency fix: ${error.message}`, "❌")
    } finally {
      setRunningEmergencyFix(false)
    }
  }

  // Direct upload to Supabase Storage using service role key
  const uploadDirectToSupabase = async (file: File, bucket: string, fileType: string) => {
    if (!file || !profileData) return null

    try {
      // Validate file types based on bucket
      if (bucket === "profile-pictures" && !file.type.includes("jpeg") && !file.type.includes("jpg")) {
        showNotification("Upload Failed", "Profile pictures must be JPG files", "❌")
        return null
      }

      if (bucket === "backgrounds" && !file.type.includes("png")) {
        showNotification("Upload Failed", "Background images must be PNG files", "❌")
        return null
      }

      // Reset progress
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 0,
      }))

      // Use server-side upload instead to bypass RLS
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)
      formData.append("userId", profileData.id)
      formData.append("email", profileData.email || "")

      setUploadDebugInfo((prev) => `${prev}\nUploading to ${bucket} via server-side API`)

      const response = await fetch("/api/upload-admin", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        setUploadDebugInfo((prev) => `${prev}\nError: ${errorData.error || "Unknown error"}`)
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()

      // Set progress to 100%
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 100,
      }))

      setUploadDebugInfo((prev) => `${prev}\nSuccess! URL: ${data.url}`)
      return data.url
    } catch (error: any) {
      console.error(`Error uploading ${fileType}:`, error.message)
      showNotification("Upload Failed", `Failed to upload ${fileType}: ${error.message}`, "❌")
      return null
    }
  }

  // Updated server-side upload function with file replacement
  const uploadFileServerSide = async (file: File, bucket: string, fileType: string) => {
    if (!file || !profileData) return null

    try {
      // Validate file types based on bucket
      if (bucket === "profile-pictures" && !file.type.includes("jpeg") && !file.type.includes("jpg")) {
        showNotification("Upload Failed", "Profile pictures must be JPG files", "❌")
        return null
      }

      if (bucket === "backgrounds" && !file.type.includes("png")) {
        showNotification("Upload Failed", "Background images must be PNG files", "❌")
        return null
      }

      // Reset progress
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 0,
      }))

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", bucket)
      formData.append("userId", profileData.id)
      formData.append("email", profileData.email || "")
      formData.append("adminKey", process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key")

      // Upload using our server-side API
      const response = await fetch("/api/upload-admin", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()

      // Set progress to 100%
      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: 100,
      }))

      return data.url
    } catch (error: any) {
      console.error(`Error uploading ${fileType}:`, error.message)
      showNotification("Upload Failed", `Failed to upload ${fileType}: ${error.message}`, "❌")
      return null
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData) return

    setLoading(true)
    setUploadDebugInfo("") // Clear previous debug info

    try {
      const updates: any = {}

      // Add social links that exist in the database schema
      if (profileData.hasOwnProperty("twitter_url")) {
        updates.twitter_url = socialLinks.twitter_url
      }

      if (profileData.hasOwnProperty("twitch_url")) {
        updates.twitch_url = socialLinks.twitch_url
      }

      if (profileData.hasOwnProperty("github_url")) {
        updates.github_url = socialLinks.github_url
      }

      if (profileData.hasOwnProperty("steam_url")) {
        updates.steam_url = socialLinks.steam_url
      }

      // Try direct upload first for profile picture
      if (profilePicture) {
        setUploadDebugInfo("Starting profile picture upload...")
        const profilePictureUrl = await uploadDirectToSupabase(profilePicture, "profile-pictures", "profilePicture")
        if (profilePictureUrl) {
          // Check if the column exists in the database schema
          if (profileData.hasOwnProperty("profile_picture_url")) {
            updates.profile_picture_url = profilePictureUrl
          } else if (profileData.hasOwnProperty("avatar_url")) {
            updates.avatar_url = profilePictureUrl
          }
          setUploadDebugInfo((prev) => `${prev}\nProfile picture uploaded: ${profilePictureUrl}`)
        }
      }

      // Upload background if selected
      if (background) {
        const backgroundUrl = await uploadDirectToSupabase(background, "backgrounds", "background")
        if (backgroundUrl) {
          // Check if the column exists in the database schema
          if (profileData.hasOwnProperty("background_url")) {
            updates.background_url = backgroundUrl
          } else if (profileData.hasOwnProperty("background_image")) {
            updates.background_image = backgroundUrl
          }
        }
      }

      // Upload background song if selected
      if (backgroundSong) {
        const backgroundSongUrl = await uploadDirectToSupabase(backgroundSong, "songs", "backgroundSong")
        if (backgroundSongUrl) {
          // Check if the column exists in the database schema
          if (profileData.hasOwnProperty("background_song_url")) {
            updates.background_song_url = backgroundSongUrl
          } else if (profileData.hasOwnProperty("song_url")) {
            updates.song_url = backgroundSongUrl
          }
        }
      }

      // Upload social media images if selected
      if (twitterImage) {
        const twitterImageUrl = await uploadDirectToSupabase(twitterImage, "twitter", "twitter")
        if (twitterImageUrl && profileData.hasOwnProperty("twitter_image_url")) {
          updates.twitter_image_url = twitterImageUrl
        }
      }

      if (twitchImage) {
        const twitchImageUrl = await uploadDirectToSupabase(twitchImage, "twitch", "twitch")
        if (twitchImageUrl && profileData.hasOwnProperty("twitch_image_url")) {
          updates.twitch_image_url = twitchImageUrl
        }
      }

      if (githubImage) {
        const githubImageUrl = await uploadDirectToSupabase(githubImage, "github", "github")
        if (githubImageUrl && profileData.hasOwnProperty("github_image_url")) {
          updates.github_image_url = githubImageUrl
        }
      }

      if (steamImage) {
        const steamImageUrl = await uploadDirectToSupabase(steamImage, "steam", "steam")
        if (steamImageUrl && profileData.hasOwnProperty("steam_image_url")) {
          updates.steam_image_url = steamImageUrl
        }
      }

      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString()

        // Log the updates we're about to make
        console.log("Updating profile with:", updates)
        setUploadDebugInfo((prev) => `${prev}\nUpdating profile with: ${JSON.stringify(updates)}`)

        const { error } = await supabase.from("profiles").update(updates).eq("id", profileData.id)

        if (error) {
          console.error("Error updating profile:", error)
          setUploadDebugInfo((prev) => `${prev}\nError updating profile: ${error.message}`)
          throw error
        }

        // Update local user profile
        if (updates.profile_picture_url || updates.avatar_url) {
          updateUserProfile(currentUser.id, {
            avatarImageUrl: updates.profile_picture_url || updates.avatar_url,
          })
        }

        if (updates.background_url || updates.background_image) {
          updateUserProfile(currentUser.id, {
            backgroundImage: updates.background_url || updates.background_image,
          })
        }

        if (updates.background_song_url || updates.song_url) {
          updateUserProfile(currentUser.id, {
            customSong: {
              ...currentUser.customSong,
              file: updates.background_song_url || updates.song_url,
            },
          })
        }

        // Update social links in local user profile
        updateUserProfile(currentUser.id, {
          twitterUrl: updates.twitter_url || currentUser.twitterUrl,
          twitchUrl: updates.twitch_url || currentUser.twitchUrl,
          githubUrl: updates.github_url || currentUser.githubUrl,
          steamUrl: updates.steam_url || currentUser.steamUrl,
        })

        showNotification("Profile Updated", "Your profile has been updated successfully", "✅")

        // Reset file states
        setProfilePicture(null)
        setBackground(null)
        setBackgroundSong(null)
        setTwitterImage(null)
        setTwitchImage(null)
        setGithubImage(null)
        setSteamImage(null)

        // Refresh profile data and files
        fetchUserProfile(profileData.id)
      } else {
        showNotification("No Changes", "No files were selected for upload", "ℹ️")
      }
    } catch (error: any) {
      console.error("Error updating profile:", error.message)
      showNotification("Update Failed", `Failed to update profile: ${error.message}`, "❌")
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get the first file from a bucket
  const getFirstFile = (bucket: string): UserFile | null => {
    if (!userFiles || !userFiles[bucket] || userFiles[bucket].length === 0) {
      return null
    }
    return userFiles[bucket][0]
  }

  // Function to completely disable RLS for storage
  const disableStorageRLS = async () => {
    setStatus("Disabling storage RLS...")
    try {
      const response = await fetch("/api/disable-storage-rls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey: process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || "admin-key" }),
      })

      const data = await response.json()
      console.log("Disable RLS result:", data)
      setStatus("Storage RLS disabled successfully")
      toast({
        title: "RLS Disabled",
        description: "Storage RLS policies have been disabled",
      })
    } catch (error) {
      console.error("Error disabling RLS:", error)
      setStatus("Failed to disable RLS")
      toast({
        title: "Failed to Disable RLS",
        description: "Check console for details",
        variant: "destructive",
      })
    }
  }

  return (
    <DraggableWindow
      title="Admin Panel"
      onClose={onClose}
      className="window bg-[rgba(30,30,30,0.95)] rounded-lg shadow-lg min-w-[500px] min-h-[400px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 300, y: 100 }}
    >
      <div className="window-content p-6 max-h-[80vh] overflow-y-auto">
        {!isLoggedIn ? (
          <div className="login-container">
            <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>

            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-black/30 border border-gray-600 rounded text-white"
                  required
                  placeholder="username@batcave.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 bg-black/30 border border-gray-600 rounded text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        ) : (
          <div className="profile-editor">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">{profileData?.username}'s Profile</h2>
                <p className="text-sm text-gray-400">Edit your profile settings</p>
              </div>
              <button
                onClick={handleLogout}
                className="py-1 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
              >
                Logout
              </button>
            </div>

            {loadingFiles && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-300">Loading your files...</span>
              </div>
            )}

            {profileData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Profile Picture (JPG only)</h3>
                  <div
                    {...profilePictureDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      profilePictureDropzone.isDragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <input {...profilePictureDropzone.getInputProps()} />

                    {profilePicture ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={URL.createObjectURL(profilePicture) || "/placeholder.svg"}
                          alt="Profile Preview"
                          className="w-24 h-24 object-cover rounded-full mb-2"
                        />
                        <p className="text-sm text-gray-300">{profilePicture.name}</p>
                      </div>
                    ) : getFirstFile("profile-pictures") ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={getFirstFile("profile-pictures")?.publicUrl || "/placeholder.svg"}
                          alt="Current Profile"
                          className="w-24 h-24 object-cover rounded-full mb-2"
                        />
                        <p className="text-sm text-gray-300">Drop a new JPG image to change</p>
                      </div>
                    ) : profileData.profile_picture_url ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={profileData.profile_picture_url || "/placeholder.svg"}
                          alt="Current Profile"
                          className="w-24 h-24 object-cover rounded-full mb-2"
                        />
                        <p className="text-sm text-gray-300">Drop a new JPG image to change</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Drag & drop a JPG profile picture here, or click to select</p>
                    )}
                  </div>
                  {uploadProgress.profilePicture > 0 && uploadProgress.profilePicture < 100 && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-700 rounded-full">
                        <div
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: `${uploadProgress.profilePicture}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Background Image (PNG only)</h3>
                  <div
                    {...backgroundDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      backgroundDropzone.isDragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <input {...backgroundDropzone.getInputProps()} />

                    {background ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={URL.createObjectURL(background) || "/placeholder.svg"}
                          alt="Background Preview"
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <p className="text-sm text-gray-300">{background.name}</p>
                      </div>
                    ) : getFirstFile("backgrounds") ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={getFirstFile("backgrounds")?.publicUrl || "/placeholder.svg"}
                          alt="Current Background"
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <p className="text-sm text-gray-300">Drop a new PNG image to change</p>
                      </div>
                    ) : profileData.background_url ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={profileData.background_url || "/placeholder.svg"}
                          alt="Current Background"
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <p className="text-sm text-gray-300">Drop a new PNG image to change</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Drag & drop a PNG background image here, or click to select</p>
                    )}
                  </div>
                  {uploadProgress.background > 0 && uploadProgress.background < 100 && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-700 rounded-full">
                        <div
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: `${uploadProgress.background}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Tools Section */}
                <div className="border-t border-gray-700 pt-6 mb-6">
                  <h3 className="text-lg font-medium mb-2">Admin Tools</h3>
                  <div className="bg-gray-800 p-4 rounded">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Fix Upload Permissions</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        If you're experiencing issues with file uploads, try these fixes:
                      </p>

                      <Button
                        onClick={disableStorageRLS}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors disabled:opacity-50 mb-3"
                      >
                        DISABLE STORAGE RLS (Most Effective Fix)
                      </Button>

                      <button
                        onClick={handleFixUploads}
                        disabled={fixingUploads}
                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors disabled:opacity-50 mb-3"
                      >
                        {fixingUploads ? "Fixing Uploads..." : "Fix Upload Permissions"}
                      </button>

                      <button
                        onClick={handleEmergencyFix}
                        disabled={runningEmergencyFix}
                        className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded transition-colors disabled:opacity-50"
                      >
                        {runningEmergencyFix
                          ? "Running Emergency Fix..."
                          : "EMERGENCY FIX: Create Buckets & Disable RLS"}
                      </button>
                    </div>

                    {status && (
                      <div className="mt-3 bg-gray-700/50 p-2 rounded text-sm">
                        <p>Status: {status}</p>
                      </div>
                    )}

                    {fixUploadResult && (
                      <div className="mt-3 text-sm">
                        <div className="bg-gray-900 p-3 rounded max-h-32 overflow-y-auto">
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(fixUploadResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Add upload debug info section */}
                    {uploadDebugInfo && (
                      <div className="mt-3">
                        <h4 className="font-medium mb-2">Upload Debug Info</h4>
                        <div className="bg-gray-900 p-3 rounded max-h-32 overflow-y-auto">
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{uploadDebugInfo}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DraggableWindow>
  )
}
