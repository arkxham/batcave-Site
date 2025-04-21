"use client"

import { useState, useEffect } from "react"

interface DesktopInfoProps {
  currentUser: any
}

export default function DesktopInfo({ currentUser }: DesktopInfoProps) {
  const [date, setDate] = useState("")

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      setDate(now.toLocaleDateString("en-US", options))
    }

    updateDate()
    // Update once per minute
    const interval = setInterval(updateDate, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="desktop-info fixed top-6 right-6 text-right z-10">
      <div className="desktop-date-info bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-lg">
        <div className="date text-white/90 text-sm">{date}</div>
        <div className="profile-info text-white/70 text-xs mt-1">Current theme: {currentUser.preferences.theme}</div>
      </div>
    </div>
  )
}
