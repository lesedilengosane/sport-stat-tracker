"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [blurActive, setBlurActive] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 500)

    const buttonTimer = setTimeout(() => {
      setShowButtons(true)
    }, 1400)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(buttonTimer)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image */}
      <Image
        src="/bgr.jpg"
        alt="Basketball player dunking"
        fill
        priority
        className={`object-cover transition-all duration-1000 ease-out ${blurActive ? "blur-sm" : ""} ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
        }`}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-between h-full px-8 md:px-16 py-12">
        {/* Main Heading - positioned at top */}
        <div>
          <h1
            className={`text-4xl md:text-6xl font-bold leading-tight transition-all duration-800 ease-out ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-orange-500">TRACK EVERY PLAY.</span>
          </h1>
          <h1
            className={`text-4xl md:text-6xl font-bold leading-tight text-white transition-all duration-800 ease-out delay-200 ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            OWN THE GAME.
          </h1>
        </div>

        {/* Bottom Content - subtitle and buttons */}
        <div className="max-w-lg">
          {/* Subtitle */}
          <p
            className={`text-white text-lg md:text-xl mb-4 leading-relaxed text-center transition-all duration-800 ease-out delay-500 ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            THE BRIGHTEST LIGHTS. THE LOUDEST CROWDS. THE BIGGEST GAMES. GET THE STATS THAT DEFINE THE MOMENTS YOU'LL
            NEVER FORGET.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 ml-8">
            <button
              className={`bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold hover:scale-105 rounded-xl 
              transition-all duration-3000 ease-out ${
                showButtons ? "opacity-100" : "opacity-0"
              }`}
              onMouseEnter={() => setBlurActive(true)}
              onMouseLeave={() => setBlurActive(false)}
              onClick={() => router.push("signin")}
            >
              SIGN IN
            </button>

            <button
              className={`border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg font-semibold hover:scale-105 bg-transparent rounded-xl 
              transition-all duration-3000 ease-out ${
                showButtons ? "opacity-100" : "opacity-0"
              }`}
              onMouseEnter={() => setBlurActive(true)}
              onMouseLeave={() => setBlurActive(false)}
              onClick={() => router.push("signup")}
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
