"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "../api/DatabaseApi/supabaseClient"
import { useAuth } from "@/app/context/AuthContext"
import { CoachSideNav } from "@/components/sideNav/coachSideNav"
import { DashboardHeader } from "@/components/header/header"
import UnassignedPlayersDialog from "@/components/coachComponents/teamManagement"
import { CoachGamesGrid } from "@/components/coach-games-grid"
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton"
import { apiClient } from "../utils/apiClient"
import TeamStats from "@/components/TeamStats/teamstats"
import PlayersList from "@/app/players/PlayersList"
import type { Game } from "@/types/basketball"

// Types
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

export default function CoachDashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const [matches, setMatches] = useState<Game[]>([]) // schedule tab
  const [allGames, setAllGames] = useState<Game[]>([]) // all-games tab
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("schedule")
  const [teamID, setTeamID] = useState<string>("")

  const name = (user?.first_name || "") + " " + (user?.last_name || "") || "User"
  const user_ID = user?.user_id || "No ID"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const convertToPlayerDetails = (lineup: any[], team: "home" | "away") =>
    lineup.map((player, index) => ({
      player_id: `${team}-player-${index}`,
      name: player.player || "Unknown",
      position: player.position || "Unknown",
    }))

  // Fetch coach-specific matches
  const fetchCoachMatches = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const matchesData = await apiClient.getMatchesByCoachId(user.user_id)

      if (!matchesData || matchesData.length === 0) {
        setMatches([])
        return
      }

      const teamIds = [
        ...new Set([...matchesData.map((m: any) => m.home_team_id), ...matchesData.map((m: any) => m.away_team_id)]),
      ]

      const teamsData = await apiClient.getTeamsByIds(teamIds)
      const teamsMap = new Map<string, Team>()
      teamsData.forEach((team: any) => {
        teamsMap.set(team.team_id, {
          team_id: team.team_id,
          name: team.team_name,
          logo: team.icon_url || "/default_team.svg",
        })
      })

      const formattedGames: Game[] = matchesData.map((match: any) => ({
        id: match.match_id,
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
        homeTeam: teamsMap.get(match.home_team_id) || {
          team_id: match.home_team_id,
          name: "Unknown Team",
          logo: "/default_team.svg",
        },
        awayTeam: teamsMap.get(match.away_team_id) || {
          team_id: match.away_team_id,
          name: "Unknown Team",
          logo: "/default_team.svg",
        },
        homeLineup: convertToPlayerDetails(match.homeLineup || [], "home"),
        awayLineup: convertToPlayerDetails(match.awayLineup || [], "away"),
      }))

      setMatches(formattedGames)
    } catch (err) {
      console.error("[CoachDashboard] Error fetching coach matches:", err)
      setError("Failed to load matches.")
      setMatches([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all matches (analyst-style)
  const fetchAllGames = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const matchesData = await apiClient.getMatches()
      if (!matchesData || matchesData.length === 0) {
        setAllGames([])
        return
      }

      const teamIds = [
        ...new Set([...matchesData.map((m: any) => m.home_team_id), ...matchesData.map((m: any) => m.away_team_id)]),
      ]

      const teamsData = await apiClient.getTeamsByIds(teamIds)
      const teamsMap = new Map<string, Team>()
      teamsData.forEach((team: any) => {
        teamsMap.set(team.team_id, {
          team_id: team.team_id,
          name: team.team_name,
          logo: team.icon_url || "/default_team.svg",
        })
      })

      const formattedGames: Game[] = matchesData.map((match: any) => ({
        id: match.match_id,
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
        homeTeam: teamsMap.get(match.home_team_id) || {
          team_id: match.home_team_id,
          name: "Unknown Team",
          logo: "/default_team.svg",
        },
        awayTeam: teamsMap.get(match.away_team_id) || {
          team_id: match.away_team_id,
          name: "Unknown Team",
          logo: "/default_team.svg",
        },
      }))

      setAllGames(formattedGames)
    } catch (err) {
      console.error("[CoachDashboard] Error fetching all matches:", err)
      setError("Failed to load all matches.")
      setAllGames([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch coach's team
  useEffect(() => {
    const fetchCoachTeam = async () => {
      if (!user) return
      try {
        const userId = user.user_id
        const { data: teamData, error } = await supabase
          .from("teams")
          .select("team_id")
          .eq("coach_id", userId)
          .maybeSingle()

        if (error) throw error
        if (teamData) setTeamID(teamData.team_id)
        else console.warn("No team found for this coach")
      } catch (err) {
        console.error("Failed to fetch coach team:", err)
      }
    }

    fetchCoachTeam()
  }, [user])

  // Fetch matches based on active tab
  useEffect(() => {
    if (activeTab === "schedule") fetchCoachMatches()
    else if (activeTab === "all-games") fetchAllGames()
  }, [activeTab, user])

  const renderTabContent = () => {
    switch (activeTab) {
      case "schedule":
        return isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto p-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <CoachGamesGrid games={matches} />
        )

      case "all-games":
        return isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto p-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <CoachGamesGrid games={allGames} />
        )

      case "team-management":
        return teamID ? (
          <UnassignedPlayersDialog coachTeamId={teamID} />
        ) : (
          <p className="text-gray-300 text-center mt-4">Loading team info...</p>
        )

      case "team-stats":
        return <TeamStats />

      case "players":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Team Players
            </h1>
            {teamID ? (
              <PlayersList teamId={teamID} />
            ) : (
              <p className="text-gray-300 text-center mt-4">
                Loading team info...
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen">
      <CoachSideNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Background image + overlay (frosted blur like analyst dashboard) */}
      <div className="fixed inset-0 z-0">
        <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover" />

        {/* Overlay that creates the frosted blur effect */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-lg" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <div className="sticky top-0 z-20 bg-transparent">
          <DashboardHeader placeholder="Search players and teams..." />
        </div>

        {error && (
          <div className="max-w-6xl mx-auto mb-6 pt-6">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">{error}</div>
          </div>
        )}
        
        {renderTabContent()}
      </div>
    </div>
  )
}
