"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/header/header"
import { FanSideNav } from "@/components/sideNav/fanSideNav"
import { SeasonHighlights } from "@/components/fanComponents/SeasonHighlights"
import { TopScorers } from "@/components/fanComponents/TopScorers"
import { GameSchedule } from "@/components/fanComponents/GameSchedule"
import { LeagueStandings } from "@/components/fanComponents/leagueStanding"
import { PlayerCards } from "@/components/fanComponents/PlayerCards"
import { GamesGrid } from "@/components/games-grid"
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton"

// Define dashboard data structure
interface FanDashboardData {
  season_highlights: any
  top_scorers: any[]
  upcoming_games: any[]
  league_standings: any[]
}

export default function FanDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [data, setData] = useState<FanDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/fan")
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderOverview = () => {
    if (!data) return null
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <SeasonHighlights highlights={data.season_highlights} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GameSchedule compact games={data.upcoming_games} />
          <TopScorers players={data.top_scorers} />
        </div>

        <LeagueStandings compact standings={data.league_standings} />
      </div>
    )
  }

  const renderPlayers = () => (
    <div className="max-w-7xl mx-auto p-6">
      <PlayerCards />
    </div>
  )

  const renderUpcomingGames = () => {
    if (isLoading) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}
        <GamesGrid games={data?.upcoming_games || []} />
      </div>
    )
  }

  const renderStandings = () => (
    <div className="max-w-7xl mx-auto p-6">
      <LeagueStandings standings={data?.league_standings || []} />
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "players":
        return renderPlayers()
      case "upcoming-games":
        return renderUpcomingGames()
      case "standings":
        return renderStandings()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="relative min-h-screen">
      <FanSideNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="fixed inset-0 z-0">
        <Image src="/bgr.jpg" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-lg" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <div className="sticky top-0 z-20 bg-transparent">
          <DashboardHeader placeholder="Search players and teams..." />
        </div>

        {renderTabContent()}
      </div>
    </div>
  )
}
