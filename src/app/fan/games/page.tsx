"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton"
import { useAuth } from "@/app/context/AuthContext"
import { useMatches } from "@/app/context/MatchesContext"
import { CoachGamesGrid } from "@/components/coach-games-grid"

// Define TypeScript interfaces based on your schema
interface Team {
  team_id: string
  name: string
  icon_url: string
}

interface Player {
  player_id: string
  position: string
  player: string
  jerseyNumber?: number
}

const convertToPlayerDetails = (lineup: any[], team: "home" | "away") => {
  return lineup.map((player, index) => {
    const nameParts = player.player?.split(" ") || ["Player", "Unknown"]
    const name = nameParts[0] || "Player"
    // The Player interface does not require surname, so omit it
    return {
      player_id: player.player_id || `${team}-player-${index}`,
      name,
      position: player.position || "Unknown",
      // jerseyNumber is optional and can be added if available
      jerseyNumber: player.jerseyNumber,
    }
  })
}

export default function FanGames() {
  const router = useRouter()

  const { allGames, matches, isLoading, error, triggerRefetch } = useMatches()
  const [activeTab, setActiveTab] = useState("completed-games")
  const { user } = useAuth()

  const upcomingGames = allGames
    .filter((game) => !game.completed)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA.getTime() - dateB.getTime() // ascending order (earliest first)
    }) //future games
  const completedGames = allGames.filter((game) => game.completed === true) //games that have been played

  // Booked (upcoming) games for this analyst

  const renderTabContent = () => {
    switch (activeTab) {
      case "completed-games":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <CoachGamesGrid
              games={completedGames.map((game) => ({
                ...game,
                homeLineup: convertToPlayerDetails(game.homeLineup || [], "home"),
                awayLineup: convertToPlayerDetails(game.awayLineup || [], "away"),
              }))}
            />
          </div>
        )
      case "upcoming-games":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-black mb-6">UPCOMING GAMES</h2>
            <CoachGamesGrid
              games={upcomingGames.map((game) => ({
                ...game,
                homeLineup: convertToPlayerDetails(game.homeLineup || [], "home"),
                awayLineup: convertToPlayerDetails(game.awayLineup || [], "away"),
              }))}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen">

      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover" />
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-lg" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <div className="sticky top-0 z-20 bg-transparent backdrop-blur-sm">
          <div className="max-w-6xl mx-auto p-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-black hover:bg-black/10 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Error message display */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6 px-6">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-black mb-6 mt-6">LOADING GAMES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <GameCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  )
}
