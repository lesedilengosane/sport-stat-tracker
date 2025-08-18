"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [blurActive, setBlurActive] = useState(false)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Image
        src="/bgr.jpg"
        alt="Basketball player dunking"
        fill
        priority
        className={`object-cover transition-all duration-300 ${blurActive ? "blur-sm" : ""}`}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div  className="relative z-10 flex flex-col justify-between h-full px-8 md:px-16 py-12">
        <div className="mb-12">
          <h1 className="text-2xl md:text-6xl font-bold leading-tight">
            <span className="text-orange-500">TRACK EVERY PLAY.</span>
          </h1>
          <h1 className="text-2xl md:text-6xl font-bold leading-tight text-white">OWN THE GAME.</h1>
        </div>


        <p className="text-white text-lg text-center md:text-xl max-w-lg leading-relaxed">
          THE BRIGHTEST LIGHTS. THE LOUDEST CROWDS. THE BIGGEST GAMES. GET THE STATS THAT DEFINE THE MOMENTS YOU'LL NEVER FORGET.
        </p>

        <div className="flex flex-wrap gap-6 ml-16">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-2 text-lg font-semibold transition-all duration-200 hover:scale-105 rounded-2xl"
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.push("/signin")}
          >
            SIGN IN
          </button>

          <button
            className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-12 py-2 text-lg font-semibold transition-all duration-200 hover:scale-105 bg-transparent rounded-2xl"
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.push("/signup")}
          > 
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  )
}
