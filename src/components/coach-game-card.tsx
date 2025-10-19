"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, Clock } from "lucide-react"

interface Team {
  team_id: string
  name: string
  logo: string
}

interface Player {
  player_id: string
  name: string
  position?: string
}

interface CoachGameCardProps {
  match_id: string
  date: string
  time: string
  homeTeam: Team
  awayTeam: Team
  location: string
  homeLineup?: Player[]
  awayLineup?: Player[]
}

export function CoachGameCard({ match_id, date, time, homeTeam, awayTeam, location }: CoachGameCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/analyst/${match_id}`)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/analyst/${match_id}`)
  }

  return (
    <Card
      onClick={handleCardClick}
      className="bg-white border-[#FE563F] p-3 text-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer"
    >
      {/* Date and Time */}
      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{time}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center flex-1">
          <div className="w-18 h-18 relative mb-0.5">
            <Image
              src={homeTeam.logo || "/placeholder.svg"}
              alt={`${homeTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-black font-medium text-center">{homeTeam.name}</span>
        </div>

        <div className="text-slate-400 font-bold text-sm mx-2">vs</div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-18 h-18 relative mb-0.5">
            <Image
              src={awayTeam.logo || "/placeholder.svg"}
              alt={`${awayTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-black font-medium text-center">{awayTeam.name}</span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center justify-center text-slate-400 text-xs mt-2">
        <span>{location}</span>
      </div>

      <div className="flex items-center justify-center text-xs font-medium mt-3">
        <button onClick={handleViewDetails} className="text-blue-400 hover:underline">
          View Details
        </button>
      </div>
    </Card>
  )
}
