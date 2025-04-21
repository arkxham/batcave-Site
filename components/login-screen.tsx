"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface LoginScreenProps {
  onLogin: (password: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 })
  const [batSignalPosition, setBatSignalPosition] = useState(0)
  const [raindrops, setRaindrops] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([])

  // Generate raindrops
  useEffect(() => {
    const drops = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 0.5 + 0.5,
    }))
    setRaindrops(drops)
  }, [])

  // Bat-signal animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatSignalPosition((prev) => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Parallax effect for background
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth - 0.5) * 20
    const y = (clientY / innerHeight - 0.5) * 20
    setBackgroundPosition({ x, y })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(password)
  }

  const toggleHint = () => {
    setShowHint(!showHint)
  }

  return (
    <div
      className="login-container relative text-white h-screen flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background with parallax effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/Photos/Default-Batman.jpg')",
          backgroundSize: "110% 110%",
          backgroundPosition: `${50 + backgroundPosition.x}% ${50 + backgroundPosition.y}%`,
          filter: "brightness(0.7) contrast(1.2)",
          transition: "background-position 0.2s ease-out",
        }}
      ></div>

      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-0"></div>

      {/* Rain effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-[1px] bg-blue-300/30 animate-rain"
            style={{
              left: `${drop.left}%`,
              top: "-20px",
              height: `${Math.random() * 20 + 10}px`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: 0.7,
              transform: `scale(${drop.size})`,
            }}
          ></div>
        ))}
      </div>

      {/* Sticky note with password hint */}
      <div
        className={`sticky-note absolute top-5 right-5 bg-[#ffc] text-black p-4 w-[200px] transform rotate-[-2deg] font-['Comic_Sans_MS',cursive] shadow-lg transition-all duration-300 cursor-pointer ${
          showHint ? "opacity-100" : "opacity-30 hover:opacity-60"
        }`}
        onClick={toggleHint}
        style={{ boxShadow: "2px 2px 10px rgba(0,0,0,0.3)" }}
      >
        {showHint ? (
          <>
            <div className="text-center font-bold mb-2 text-red-800">TOP SECRET</div>
            <div>Password: Batcave</div>
            <div className="text-xs mt-2 text-gray-700">Click to hide</div>
          </>
        ) : (
          <>
            <div className="text-center">Password Hint</div>
            <div className="text-xs mt-2 text-gray-700">(Click to reveal)</div>
          </>
        )}
      </div>

      {/* Login form */}
      <div className="login-form relative z-20 bg-black/60 p-8 rounded-lg w-[350px] border border-white/20 backdrop-blur-md shadow-2xl">
        <div className="logo mb-6 flex justify-center">
          <svg viewBox="0 0 100 60" width="80" height="48" className="fill-yellow-400">
            <path d="M50,0 C60,0 70,5 80,15 C70,5 65,0 50,0 C35,0 30,5 20,15 C30,5 40,0 50,0 Z" />
            <path d="M50,10 C55,10 60,12 65,17 C60,12 55,10 50,10 C45,10 40,12 35,17 C40,12 45,10 50,10 Z" />
            <path d="M20,15 C30,30 40,40 50,40 C60,40 70,30 80,15 C75,25 65,40 50,60 C35,40 25,25 20,15 Z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center text-yellow-400">GOTHAM CITY SECURE SYSTEM</h2>

        <div className="form-group mb-5">
          <label htmlFor="username" className="block mb-2 text-[#ccc] text-sm">
            USERNAME
          </label>
          <input
            type="text"
            id="username"
            value="Bruce Wayne"
            readOnly
            className="w-full p-3 bg-[#111] border border-[#444] text-white rounded focus:border-yellow-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="form-group mb-6">
          <label htmlFor="password" className="block mb-2 text-[#ccc] text-sm">
            PASSWORD
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-[#111] border border-[#444] text-white rounded focus:border-yellow-400 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full p-3 bg-yellow-700 text-white border-none rounded cursor-pointer transition-all hover:bg-yellow-600 font-bold uppercase tracking-wider"
        >
          Login
        </button>

        <div className="text-center mt-4 text-xs text-gray-400">
          Authorized Personnel Only
          <br />
          Wayne Enterprises © {new Date().getFullYear()}
        </div>
      </div>

      {/* City silhouette */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          width="100%"
          height="150"
          className="fill-black opacity-70"
        >
          <path d="M0,200 L0,110 L50,100 L70,60 L80,100 L120,80 L140,110 L160,70 L180,90 L200,50 L220,80 L250,70 L280,100 L300,60 L320,90 L340,50 L360,80 L380,60 L400,90 L420,40 L440,90 L460,70 L480,100 L500,60 L520,90 L540,70 L560,100 L580,80 L600,110 L620,60 L640,90 L660,70 L680,100 L700,50 L720,90 L740,60 L760,100 L780,70 L800,90 L820,60 L840,100 L860,70 L880,90 L900,50 L920,80 L940,60 L960,90 L980,70 L1000,100 L1020,60 L1040,90 L1060,70 L1080,100 L1100,60 L1120,90 L1140,70 L1160,100 L1180,80 L1200,110 L1200,200 Z" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes rain {
          0% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(calc(100vh + 20px));
          }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>
    </div>
  )
}
