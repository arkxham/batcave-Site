"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define user preferences interface
interface UserPreferences {
  theme: "dark" | "light" | "system"
  accentColor: string
  fontSize: "small" | "medium" | "large"
  animations: boolean
  desktopLayout: "grid" | "list"
  taskbarPosition: "bottom" | "top" | "left" | "right"
  autoPlayMusic: boolean
  showClock: boolean
  showNotifications: boolean
}

// Define user files interface
interface UserFile {
  id: string
  name: string
  type: "document" | "image" | "video" | "audio" | "other"
  path: string
  content?: string
  lastModified: string
  favorite: boolean
}

// Define user profile interface
interface UserProfile {
  username: string
  avatarImageUrl: string
  songFilePath: string
  twitterUrl: string
  twitchUrl: string
  githubUrl: string
  steamUrl: string
  customSong: {
    title: string
    artist: string
    file: string
    thumbnail: string
  }
  backgroundImage: string
  preferences: UserPreferences
  files: UserFile[]
  pinnedApps: string[]
  bio: string
  lastLogin: string
  createdAt: string
  isAdmin: boolean
}

interface UserProfiles {
  [key: string]: UserProfile
}

interface UserContextType {
  currentUser: UserProfile & { id: string }
  setCurrentUser: (userId: string) => void
  userProfiles: UserProfiles
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => void
  updateUserPreference: (userId: string, key: keyof UserPreferences, value: any) => void
  addUserFile: (userId: string, file: Omit<UserFile, "id" | "lastModified">) => void
  updateUserFile: (userId: string, fileId: string, updates: Partial<Omit<UserFile, "id">>) => void
  deleteUserFile: (userId: string, fileId: string) => void
  toggleFileFavorite: (userId: string, fileId: string) => void
  getUserFiles: (userId: string, type?: UserFile["type"]) => UserFile[]
  getFavoriteFiles: (userId: string) => UserFile[]
  getRecentFiles: (userId: string, limit?: number) => UserFile[]
}

// Default user preferences
const defaultPreferences: UserPreferences = {
  theme: "dark",
  accentColor: "#0078d7",
  fontSize: "medium",
  animations: true,
  desktopLayout: "grid",
  taskbarPosition: "bottom",
  autoPlayMusic: false,
  showClock: true,
  showNotifications: true,
}

// Generate a default set of files for each user
const generateDefaultFiles = (username: string): UserFile[] => {
  return [
    {
      id: `${username.toLowerCase()}-welcome`,
      name: "Welcome.txt",
      type: "document",
      path: `/Documents/Welcome.txt`,
      content: `Welcome to ${username}'s desktop!\n\nThis is your personal space. Feel free to customize it to your liking.`,
      lastModified: new Date().toISOString(),
      favorite: true,
    },
    {
      id: `${username.toLowerCase()}-notes`,
      name: "Notes.txt",
      type: "document",
      path: `/Documents/Notes.txt`,
      content: "Important notes and reminders go here.",
      lastModified: new Date().toISOString(),
      favorite: false,
    },
    {
      id: `${username.toLowerCase()}-profile`,
      name: `${username}.jpg`,
      type: "image",
      path: `/Photos/Profile/${username}.jpg`,
      lastModified: new Date().toISOString(),
      favorite: true,
    },
  ]
}

// Define user profiles with the correct usernames
const userProfiles: UserProfiles = {
  rtmonly: {
    username: "rtmonly",
    avatarImageUrl: "/Photos/app1.jpg",
    songFilePath: "songs/song1.mp3",
    twitterUrl: "https://twitter.com/rtmonly",
    twitchUrl: "https://twitch.tv/rtmonly",
    githubUrl: "https://github.com/rtmonly",
    steamUrl: "https://steamcommunity.com/id/rtmonly/",
    customSong: {
      title: "On Melancholy Hill",
      artist: "Gorillaz",
      file: "songs/song1.mp3",
      thumbnail: "Thumbnails/Melachony.png",
    },
    backgroundImage: "/Photos/Default-Batman.jpg",
    preferences: {
      ...defaultPreferences,
      accentColor: "#00bfff",
      animations: true,
    },
    files: generateDefaultFiles("rtmonly"),
    pinnedApps: ["music", "settings", "documents"],
    bio: "Digital artist and music producer. Creating visual experiences.",
    lastLogin: new Date().toISOString(),
    createdAt: "2023-01-15T12:00:00Z",
    isAdmin: true,
  },
  n333mo: {
    username: "n333mo",
    avatarImageUrl: "/Photos/app2.jpg",
    songFilePath: "songs/song2.mp3",
    twitterUrl: "https://twitter.com/n333mo_",
    twitchUrl: "https://twitch.tv/n333mo_",
    githubUrl: "https://github.com/n333mo",
    steamUrl: "https://steamcommunity.com/id/n333mo/",
    customSong: {
      title: "13 nuyork nights at 21",
      artist: "Uzi Vert",
      file: "songs/song2.mp3",
      thumbnail: "Thumbnails/nuyrok.jpg",
    },
    backgroundImage: "/Photos/batman.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#333333",
    },
    files: generateDefaultFiles("n333mo"),
    pinnedApps: ["documents", "settings"],
    bio: "I am vengeance. I am the night.",
    lastLogin: "2023-06-01T22:45:00Z",
    createdAt: "2022-11-05T23:00:00Z",
    isAdmin: true,
  },
  slos: {
    username: "slos",
    avatarImageUrl: "/Photos/app3.jpg",
    songFilePath: "songs/song3.mp3",
    twitterUrl: "https://twitter.com/slosgpx",
    twitchUrl: "https://twitch.tv/sl0s",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/id/slosgpx/",
    customSong: {
      title: "Slos Theme",
      artist: "Unknown",
      file: "songs/song3.mp3",
      thumbnail: "Thumbnails/forest.jpg",
    },
    backgroundImage: "/Photos/forest.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "light",
      accentColor: "#4caf50",
    },
    files: generateDefaultFiles("slos"),
    pinnedApps: ["pictures", "documents"],
    bio: "Nature enthusiast and environmental advocate.",
    lastLogin: "2023-05-15T08:30:00Z",
    createdAt: "2023-01-02T10:00:00Z",
    isAdmin: false,
  },
  arkham: {
    username: "arkham",
    avatarImageUrl: "/Photos/app4.jpg",
    songFilePath: "songs/song4.mp3",
    twitterUrl: "https://twitter.com/arkxham_",
    twitchUrl: "https://bats.rip",
    githubUrl: "https://github.com/arkxham",
    steamUrl: "https://steamcommunity.com/id/arkxham/",
    customSong: {
      title: "Arkham City",
      artist: "Dark Knight",
      file: "songs/song4.mp3",
      thumbnail: "Thumbnails/gotham.jpg",
    },
    backgroundImage: "/Photos/gotham.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#607d8b",
    },
    files: generateDefaultFiles("arkham"),
    pinnedApps: ["settings", "directory"],
    bio: "The city that never sleeps, always watching.",
    lastLogin: "2023-05-25T21:15:00Z",
    createdAt: "2022-10-15T18:30:00Z",
    isAdmin: true,
  },
  outlaw: {
    username: "outlaw",
    avatarImageUrl: "/Photos/app5.jpg",
    songFilePath: "songs/song5.mp3",
    twitterUrl: "https://twitter.com/akaoutlaw",
    twitchUrl: "https://twitch.tv/akaoutlaw",
    githubUrl: "https://github.com/arkxham",
    steamUrl: "https://steamcommunity.com/profiles/76561199189690553",
    customSong: {
      title: "Outlaw's Theme",
      artist: "Unknown",
      file: "songs/song5.mp3",
      thumbnail: "Thumbnails/randal.jpg",
    },
    backgroundImage: "/Photos/randal.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "light",
      accentColor: "#ff9800",
    },
    files: generateDefaultFiles("outlaw"),
    pinnedApps: ["music", "pictures", "documents"],
    bio: "Just a regular guy with irregular thoughts.",
    lastLogin: "2023-05-29T12:45:00Z",
    createdAt: "2023-03-10T14:20:00Z",
    isAdmin: false,
  },
  gekk: {
    username: "gekk",
    avatarImageUrl: "/Photos/app6.jpg",
    songFilePath: "songs/song6.mp3",
    twitterUrl: "https://twitter.com/GEKKSKI",
    twitchUrl: "https://twitch.tv/gekk",
    githubUrl: "https://github.com/gekk",
    steamUrl: "https://steamcommunity.com/id/gekk-",
    customSong: {
      title: "Hat Trick",
      artist: "Protect",
      file: "songs/song6.mp3",
      thumbnail: "Thumbnails/HT.png",
    },
    backgroundImage: "/Photos/batmobile.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#f44336",
    },
    files: generateDefaultFiles("gekk"),
    pinnedApps: ["settings", "directory"],
    bio: "The ultimate vehicle for justice.",
    lastLogin: "2023-05-27T23:10:00Z",
    createdAt: "2022-11-20T16:40:00Z",
    isAdmin: false,
  },
  lydell: {
    username: "lydell",
    avatarImageUrl: "/Photos/app7.jpg",
    songFilePath: "songs/song7.mp3",
    twitterUrl: "https://twitter.com/lydeli",
    twitchUrl: "https://twitch.tv/lydeli",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/id/8inchDeli/",
    customSong: {
      title: "OPM BABI",
      artist: "Playboi Carti",
      file: "songs/song7.mp3",
      thumbnail: "Thumbnails/OB.png",
    },
    backgroundImage: "/Photos/joker.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#4caf50",
    },
    files: generateDefaultFiles("lydell"),
    pinnedApps: ["music", "pictures"],
    bio: "Why so serious?",
    lastLogin: "2023-05-28T14:20:00Z",
    createdAt: "2022-12-25T00:00:00Z",
    isAdmin: false,
  },
  clipzy: {
    username: "clipzy",
    avatarImageUrl: "/Photos/app8.jpg",
    songFilePath: "songs/song8.mp3",
    twitterUrl: "https://twitter.com/clpzy",
    twitchUrl: "https://twitch.tv/clipzy",
    githubUrl: "https://github.com/clipzy",
    steamUrl: "https://steamcommunity.com/id/8cs/",
    customSong: {
      title: "If It Aint Wok",
      artist: "Lucki",
      file: "songs/song8.mp3",
      thumbnail: "Thumbnails/IFAW.jpg",
    },
    backgroundImage: "/Photos/zebra.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "light",
      accentColor: "#9e9e9e",
    },
    files: generateDefaultFiles("clipzy"),
    pinnedApps: ["pictures", "music"],
    bio: "Black and white and unique all over.",
    lastLogin: "2023-05-26T10:30:00Z",
    createdAt: "2023-02-05T11:15:00Z",
    isAdmin: false,
  },
  jack: {
    username: "jack",
    avatarImageUrl: "/Photos/app9.jpg",
    songFilePath: "songs/song9.mp3",
    twitterUrl: "https://twitter.com/UpdateStable",
    twitchUrl: "https://twitch.tv/freedm_",
    githubUrl: "https://github.com/jack",
    steamUrl: "https://steamcommunity.com/id/freedm_/",
    customSong: {
      title: "Jack's Theme",
      artist: "Jack",
      file: "songs/song9.mp3",
      thumbnail: "Thumbnails/zebra.jpg",
    },
    backgroundImage: "/Photos/losSave.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#2196f3",
    },
    files: generateDefaultFiles("jack"),
    pinnedApps: ["documents", "directory"],
    bio: "Saving the world, one pixel at a time.",
    lastLogin: "2023-05-28T18:20:00Z",
    createdAt: "2023-01-30T09:45:00Z",
    isAdmin: false,
  },
  junz: {
    username: "junz",
    avatarImageUrl: "/Photos/app10.jpg",
    songFilePath: "songs/song10.mp3",
    twitterUrl: "https://twitter.com/Junzlol_",
    twitchUrl: "https://twitch.tv/junzioi",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/profiles/76561199119147695",
    customSong: {
      title: "Los Save Us",
      artist: "Savior",
      file: "songs/song10.mp3",
      thumbnail: "Thumbnails/lossave.jpg",
    },
    backgroundImage: "/Photos/blatt.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#673ab7",
    },
    files: generateDefaultFiles("junz"),
    pinnedApps: ["music", "pictures"],
    bio: "Music producer and beat maker extraordinaire.",
    lastLogin: "2023-05-30T20:15:00Z",
    createdAt: "2023-03-15T13:30:00Z",
    isAdmin: false,
  },
  mocha: {
    username: "mocha",
    avatarImageUrl: "/Photos/app11.jpg",
    songFilePath: "songs/song11.mp3",
    twitterUrl: "https://twitter.com/MochaFNBR",
    twitchUrl: "https://twitch.tv/1m0cha",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/id/mochafn/",
    customSong: {
      title: "Mocha Beat",
      artist: "Mocha",
      file: "songs/song11.mp3",
      thumbnail: "Thumbnails/blatt.jpg",
    },
    backgroundImage: "/Photos/Default-Batman.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#673ab7",
    },
    files: generateDefaultFiles("mocha"),
    pinnedApps: ["music", "pictures"],
    bio: "Coffee lover and code writer.",
    lastLogin: "2023-05-30T20:15:00Z",
    createdAt: "2023-03-15T13:30:00Z",
    isAdmin: false,
  },
  said: {
    username: "said",
    avatarImageUrl: "/Photos/app12.jpg",
    songFilePath: "songs/song1.mp3",
    twitterUrl: "https://twitter.com/_saidd1",
    twitchUrl: "https://twitch.tv/said1",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/id/said3q/",
    customSong: {
      title: "Said's Theme",
      artist: "Said",
      file: "songs/song1.mp3",
      thumbnail: "Thumbnails/Melachony.png",
    },
    backgroundImage: "/Photos/batman4.jpg",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#673ab7",
    },
    files: generateDefaultFiles("said"),
    pinnedApps: ["music", "pictures"],
    bio: "Always has something to say.",
    lastLogin: "2023-05-30T20:15:00Z",
    createdAt: "2023-03-15T13:30:00Z",
    isAdmin: false,
  },
  scorpy: {
    username: "scorpy",
    avatarImageUrl: "/Photos/app13.jpg",
    songFilePath: "songs/song2.mp3",
    twitterUrl: "https://twitter.com/ScorpyL2",
    twitchUrl: "https://twitch.tv/ScorpyL2",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/id/scorpy/",
    customSong: {
      title: "Scorpy's Theme",
      artist: "Scorpy",
      file: "songs/song2.mp3",
      thumbnail: "Thumbnails/nuyrok.jpg",
    },
    backgroundImage: "/Photos/badbih.png",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#673ab7",
    },
    files: generateDefaultFiles("scorpy"),
    pinnedApps: ["music", "pictures"],
    bio: "Stinging beats and sharp lyrics.",
    lastLogin: "2023-05-30T20:15:00Z",
    createdAt: "2023-03-15T13:30:00Z",
    isAdmin: false,
  },
  trystin: {
    username: "trystin",
    avatarImageUrl: "/Photos/app14.jpg",
    songFilePath: "songs/song3.mp3",
    twitterUrl: "https://twitter.com/Trystin002",
    twitchUrl: "https://twitch.tv/y0imTrystin",
    githubUrl: "https://github.com/80dropz",
    steamUrl: "https://steamcommunity.com/id/trystin/",
    customSong: {
      title: "Trystin's Theme",
      artist: "Trystin",
      file: "songs/song3.mp3",
      thumbnail: "Thumbnails/forest.jpg",
    },
    backgroundImage: "/Photos/Forest.png",
    preferences: {
      ...defaultPreferences,
      theme: "dark",
      accentColor: "#673ab7",
    },
    files: generateDefaultFiles("trystin"),
    pinnedApps: ["music", "pictures"],
    bio: "Always trying something new.",
    lastLogin: "2023-05-30T20:15:00Z",
    createdAt: "2023-03-15T13:30:00Z",
    isAdmin: false,
  },
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("rtmonly")
  const [profiles, setProfiles] = useState<UserProfiles>(userProfiles)
  const [forceUpdate, setForceUpdate] = useState(0) // Add this to force re-renders

  // Update last login time when user is switched
  useEffect(() => {
    if (currentUserId) {
      updateUserProfile(currentUserId, {
        lastLogin: new Date().toISOString(),
      })

      // Force a re-render when user changes
      setForceUpdate((prev) => prev + 1)

      console.log("Current user ID changed to:", currentUserId)
      console.log("Current username:", profiles[currentUserId]?.username)
    }
  }, [currentUserId])

  const setCurrentUser = (userId: string) => {
    if (profiles[userId]) {
      console.log("Setting current user to:", userId)
      setCurrentUserId(userId)
    } else {
      console.error("User profile not found:", userId)
    }
  }

  // Update an entire user profile
  const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    if (profiles[userId]) {
      setProfiles((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          ...updates,
        },
      }))
    }
  }

  // Update a specific user preference
  const updateUserPreference = (userId: string, key: keyof UserPreferences, value: any) => {
    if (profiles[userId]) {
      setProfiles((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          preferences: {
            ...prev[userId].preferences,
            [key]: value,
          },
        },
      }))
    }
  }

  // Add a new file to a user's files
  const addUserFile = (userId: string, file: Omit<UserFile, "id" | "lastModified">) => {
    if (profiles[userId]) {
      const newFile: UserFile = {
        ...file,
        id: `${userId}-${file.name}-${Date.now()}`,
        lastModified: new Date().toISOString(),
      }

      setProfiles((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          files: [...prev[userId].files, newFile],
        },
      }))
    }
  }

  // Update an existing file
  const updateUserFile = (userId: string, fileId: string, updates: Partial<Omit<UserFile, "id">>) => {
    if (profiles[userId]) {
      setProfiles((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          files: prev[userId].files.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  ...updates,
                  lastModified: new Date().toISOString(),
                }
              : file,
          ),
        },
      }))
    }
  }

  // Delete a file
  const deleteUserFile = (userId: string, fileId: string) => {
    if (profiles[userId]) {
      setProfiles((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          files: prev[userId].files.filter((file) => file.id !== fileId),
        },
      }))
    }
  }

  // Toggle favorite status of a file
  const toggleFileFavorite = (userId: string, fileId: string) => {
    if (profiles[userId]) {
      setProfiles((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          files: prev[userId].files.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  favorite: !file.favorite,
                }
              : file,
          ),
        },
      }))
    }
  }

  // Get all files for a user, optionally filtered by type
  const getUserFiles = (userId: string, type?: UserFile["type"]) => {
    if (!profiles[userId]) return []

    if (type) {
      return profiles[userId].files.filter((file) => file.type === type)
    }

    return profiles[userId].files
  }

  // Get favorite files for a user
  const getFavoriteFiles = (userId: string) => {
    if (!profiles[userId]) return []
    return profiles[userId].files.filter((file) => file.favorite)
  }

  // Get recent files for a user, sorted by last modified date
  const getRecentFiles = (userId: string, limit = 5) => {
    if (!profiles[userId]) return []

    return [...profiles[userId].files]
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, limit)
  }

  const value = {
    currentUser: { ...profiles[currentUserId], id: currentUserId },
    setCurrentUser,
    userProfiles: profiles,
    updateUserProfile,
    updateUserPreference,
    addUserFile,
    updateUserFile,
    deleteUserFile,
    toggleFileFavorite,
    getUserFiles,
    getFavoriteFiles,
    getRecentFiles,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
