"use client"

import { useEffect, useState } from "react"

export default function BootAnimation() {
  const [currentStatus, setCurrentStatus] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [scanlineOpacity, setScanlineOpacity] = useState(0.2)

  const statusMessages = [
    "Initializing system...",
    "Loading core modules...",
    "Checking system integrity...",
    "Establishing secure connection...",
    "Loading user interface...",
    "System ready",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus((prev) => {
        if (prev < statusMessages.length - 1) {
          return prev + 1
        } else {
          clearInterval(interval)

          // Start fade out animation
          setTimeout(() => {
            setOpacity(0)
          }, 500)

          return prev
        }
      })
    }, 250)

    // Scanline flicker effect
    const scanlineInterval = setInterval(() => {
      setScanlineOpacity((prev) => 0.1 + Math.random() * 0.2)
    }, 100)

    return () => {
      clearInterval(interval)
      clearInterval(scanlineInterval)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-[10000] bg-black"
      style={{ opacity, transition: "opacity 0.5s ease-out" }}
    >
      {/* Scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%)",
          backgroundSize: "100% 4px",
          opacity: scanlineOpacity,
        }}
      ></div>

      <div className="w-[200px] h-[120px] mb-10 relative">
        <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M300,60 C380,60 450,80 500,120 C470,80 450,40 430,20 C410,40 380,50 300,50 C220,50 190,40 170,20 C150,40 130,80 100,120 C150,80 220,60 300,60 Z"
            fill="#111"
            stroke="#00bfff"
            strokeWidth="2"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: "drawBat 1.5s forwards, glowBat 1.5s 1.5s infinite alternate",
            }}
          />
        </svg>

        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-md"
          style={{
            background: "radial-gradient(circle, rgba(0,191,255,0.2) 0%, rgba(0,0,0,0) 70%)",
            animation: "pulse 2s infinite alternate",
          }}
        ></div>
      </div>

      <div className="text-[#00bfff] font-mono text-base text-center opacity-0 animate-[fadeIn_0.3s_0.3s_forwards]">
        INITIALIZING BATCOMPUTER...
      </div>

      <div className="w-[300px] h-1 bg-[#222] rounded mt-5 overflow-hidden relative">
        <div
          className="h-full w-0 bg-[#00bfff] absolute shadow-[0_0_10px_#00bfff]"
          style={{ animation: "loadProgress 1.5s ease-in-out forwards" }}
        />
      </div>

      <div className="text-[#666] font-mono text-xs mt-2.5 h-[15px] text-center">{statusMessages[currentStatus]}</div>

      {/* Terminal-like text output */}
      <div className="mt-8 w-[400px] h-[100px] bg-black/50 border border-[#333] rounded overflow-hidden p-2">
        <div className="font-mono text-[10px] text-green-500 h-full overflow-hidden">
          {Array.from({ length: currentStatus + 1 }).map((_, i) => (
            <div key={i} className="terminal-line" style={{ animation: `typewriter 0.5s ${i * 0.2}s forwards` }}>
              {i === 0 && "> Initializing Batcomputer v4.5.2..."}
              {i === 1 && "> Loading security protocols..."}
              {i === 2 && "> Checking Batcave subsystems..."}
              {i === 3 && "> Establishing secure connection to Wayne Enterprises..."}
              {i === 4 && "> Activating defense systems..."}
              {i === 5 && "> System ready. Welcome, Bruce Wayne."}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes drawBat {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes glowBat {
          from {
            filter: drop-shadow(0 0 5px rgba(0, 191, 255, 0.8));
            fill: #111;
          }
          to {
            filter: drop-shadow(0 0 20px rgba(0, 191, 255, 1));
            fill: rgba(0, 191, 255, 0.3);
          }
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        
        @keyframes loadProgress {
          0% { width: 0%; }
          20% { width: 20%; }
          40% { width: 38%; }
          50% { width: 52%; }
          60% { width: 65%; }
          80% { width: 85%; }
          95% { width: 98%; }
          100% { width: 100%; }
        }
        
        @keyframes pulse {
          from { opacity: 0.3; }
          to { opacity: 0.7; }
        }
        
        @keyframes typewriter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
