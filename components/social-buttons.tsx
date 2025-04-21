"use client"

import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function SocialButtons() {
  const { currentUser } = useUser()
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    // Fetch the current user's profile data from Supabase
    const fetchProfileData = async () => {
      try {
        // Try to find the profile by username
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", currentUser.username)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          return
        }

        if (data) {
          setProfileData(data)
        }
      } catch (err) {
        console.error("Error fetching profile data:", err)
      }
    }

    fetchProfileData()
  }, [currentUser.username])

  // Use Supabase data if available, otherwise fall back to context data
  const twitterUrl = profileData?.twitter_url || currentUser.twitterUrl
  const twitchUrl = profileData?.twitch_url || currentUser.twitchUrl
  const githubUrl = profileData?.github_url || currentUser.githubUrl
  const steamUrl = profileData?.steam_url || currentUser.steamUrl

  return (
    <div className="social-buttons-container fixed bottom-16 right-6 flex flex-col gap-3 z-10">
      {twitterUrl && (
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button w-[50px] h-[50px] rounded-full bg-[rgba(40,40,40,0.8)] flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shadow-lg backdrop-blur border border-white/10 relative hover:translate-y-[-5px] hover:shadow-xl hover:bg-[rgba(60,60,60,0.8)]"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
            className="social-icon w-[25px] h-[25px] object-contain"
            alt="Twitter"
          />
          <div className="social-tooltip absolute right-[60px] top-1/2 transform -translate-y-1/2 bg-black/80 text-white py-1 px-2.5 rounded text-xs opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap group-hover:opacity-100">
            Twitter
          </div>
        </a>
      )}

      {twitchUrl && (
        <a
          href={twitchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button w-[50px] h-[50px] rounded-full bg-[rgba(40,40,40,0.8)] flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shadow-lg backdrop-blur border border-white/10 relative hover:translate-y-[-5px] hover:shadow-xl hover:bg-[rgba(60,60,60,0.8)]"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/5968/5968819.png"
            className="social-icon w-[25px] h-[25px] object-contain"
            alt="Twitch"
          />
          <div className="social-tooltip absolute right-[60px] top-1/2 transform -translate-y-1/2 bg-black/80 text-white py-1 px-2.5 rounded text-xs opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap group-hover:opacity-100">
            Twitch
          </div>
        </a>
      )}

      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button w-[50px] h-[50px] rounded-full bg-[rgba(40,40,40,0.8)] flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shadow-lg backdrop-blur border border-white/10 relative hover:translate-y-[-5px] hover:shadow-xl hover:bg-[rgba(60,60,60,0.8)]"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733553.png"
            className="social-icon w-[25px] h-[25px] object-contain"
            alt="GitHub"
          />
          <div className="social-tooltip absolute right-[60px] top-1/2 transform -translate-y-1/2 bg-black/80 text-white py-1 px-2.5 rounded text-xs opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap group-hover:opacity-100">
            GitHub
          </div>
        </a>
      )}

      {steamUrl && (
        <a
          href={steamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-button w-[50px] h-[50px] rounded-full bg-[rgba(40,40,40,0.8)] flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shadow-lg backdrop-blur border border-white/10 relative hover:translate-y-[-5px] hover:shadow-xl hover:bg-[rgba(60,60,60,0.8)]"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3670/3670382.png"
            className="social-icon w-[25px] h-[25px] object-contain"
            alt="Steam"
          />
          <div className="social-tooltip absolute right-[60px] top-1/2 transform -translate-y-1/2 bg-black/80 text-white py-1 px-2.5 rounded text-xs opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap group-hover:opacity-100">
            Steam
          </div>
        </a>
      )}
    </div>
  )
}
