"use client"

import type React from "react"
import Image from "next/image"
import { Users } from "lucide-react"

interface TeamDetailsProps {
  teamName: string
  numPlayers: number | string
  teamLogo?: string
}

const TeamDetails: React.FC<TeamDetailsProps> = ({ teamName, numPlayers, teamLogo }) => {
  return (
    <div className="relative w-full bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 shadow-lg p-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Team Logo with Pulsing Effect */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute w-32 h-32 rounded-full border-2 border-orange-500/20 animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute w-40 h-40 rounded-full border-2 border-orange-500/10 animate-ping"
              style={{ animationDuration: "4s", animationDelay: "0.5s" }}
            />
          </div>

          <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              {teamLogo ? (
                <Image
                  src={teamLogo || "/placeholder.svg"}
                  alt={teamName}
                  width={80}
                  height={80}
                  className="rounded-full object-contain"
                />
              ) : (
                <span className="text-4xl font-bold text-orange-500">{teamName.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-black mb-3">{teamName}</h1>

          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Users className="h-5 w-5 text-orange-500" />
            <span className="text-xl font-semibold text-orange-500">{numPlayers}</span>
            <span className="text-base text-black/60">Active Players</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamDetails
