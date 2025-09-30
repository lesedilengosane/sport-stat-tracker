"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/header/header"
import { FanSideNav } from "@/components/sideNav/fanSideNav"
import { SeasonHighlights } from "@/components/fanComponents/SeasonHighlights"
import { TopScorers } from "@/components/fanComponents/TopScorers"
import { GameSchedule } from "@/components/fanComponents/GameSchedule"
import { LeagueStandings } from "@/components/fanComponents/leagueStanding"
import  PlayerCards  from "@/components/fanComponents/PlayerCards"
import { GamesGrid } from "@/components/games-grid"
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton"
import { apiClient } from "../utils/apiClient"
import {Game} from "@/types/basketball"

interface Team {
  team_id: string
  name: string
  icon_url: string
}

interface Match {
  match_id: string
  match_date: string
  location: string | null
  home_score: number
  away_score: number
  status: string
  home_team_id: string
  away_team_id: string
}



export default function FanDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)

  const fetchUpcomingGames = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const matchesData = await apiClient.getMatches()

      if (matchesData && matchesData.length > 0) {
        const teamIds = [
          ...new Set([
            ...matchesData.map((m: Match) => m.home_team_id),
            ...matchesData.map((m: Match) => m.away_team_id),
          ]),
        ]

        const teamsData = await apiClient.getTeamsByIds(teamIds)

        const teamsMap = new Map()
        teamsData?.forEach((team: Team) => {
          teamsMap.set(team.team_id, team)
        })

        const formattedGames: Game[] = matchesData.map((match: Match) => {
          const homeTeam = teamsMap.get(match.home_team_id) || {}
          const awayTeam = teamsMap.get(match.away_team_id) || {}

          return {
            match_id: match.match_id,
            date: new Date(match.match_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time: new Date(match.match_date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            location: match.location || "Unknown",
            homeTeam: {
              team_id: match.home_team_id,
              name: homeTeam.name || homeTeam.team_name || "Unknown Team",
              logo: homeTeam.icon_url || "/default_team.svg",
            },
            awayTeam: {
              team_id: match.away_team_id,
              name: awayTeam.name || awayTeam.team_name || "Unknown Team",
              logo: awayTeam.icon_url || "/default_team.svg",
            },
          }
        })

        setGames(formattedGames)
      }
    } catch (err: any) {
      console.error("Error fetching games:", err)
      setError("Failed to load games.")
      setGames([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "upcoming-games") {
      fetchUpcomingGames()
    }
  }, [activeTab])

  const renderOverview = () => (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <SeasonHighlights />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GameSchedule compact />
        <TopScorers />
      </div>

      <LeagueStandings compact />
    </div>
  )

  const renderPlayers = () => (
    <div className="max-w-7xl mx-auto p-6">
      <PlayerCards />
      {/*<PlayersList teamId={teamId} />*/}
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
        <GamesGrid games={games} />
      </div>
    )
  }

  const renderStandings = () => (
    <div className="max-w-7xl mx-auto p-6">
      <LeagueStandings />
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
