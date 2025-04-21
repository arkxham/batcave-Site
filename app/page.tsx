"use client"

import { useState } from "react"
import BootAnimation from "@/components/boot-animation"
import LoginScreen from "@/components/login-screen"
import Desktop from "@/components/desktop"
import { UserProvider } from "@/context/user-context"
import { AudioProvider } from "@/context/audio-context"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "boot" | "desktop">("login")

  const handleLogin = (password: string) => {
    if (password === "Batcave") {
      setCurrentScreen("boot")

      // After boot animation completes, show desktop
      setTimeout(() => {
        setCurrentScreen("desktop")
      }, 3000)
    } else {
      alert("Incorrect password!")
    }
  }

  const handleLogout = () => {
    setCurrentScreen("login")
  }

  return (
    <UserProvider>
      <AudioProvider>
        <main className="h-screen w-screen overflow-hidden">
          {currentScreen === "login" && <LoginScreen onLogin={handleLogin} />}

          {currentScreen === "boot" && <BootAnimation />}

          {currentScreen === "desktop" && <Desktop onLogout={handleLogout} />}
        </main>
      </AudioProvider>
    </UserProvider>
  )
}
