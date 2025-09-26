// app/analyst/page.tsx
"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../api/DatabaseApi/supabaseClient"
import { GamesGrid } from "@/components/games-grid"
import { apiClient } from "../utils/apiClient"
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton"
import { useAuth } from "../context/AuthContext"
import { AnalystSideNav } from "@/components/sideNav/analystSideNav"
import { DashboardHeader } from "@/components/header/header"

// Define TypeScript interfaces based on your schema
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

interface Player {
  player_id: string
  position: string
  player: string
  jerseyNumber?: number
}

interface Game {
  match_id: string
  date: string
  time: string
  location: string
  homeTeam: { team_id: string; name: string; logo: string }
  awayTeam: { team_id: string; name: string; logo: string }
  homeLineup?: Player[]
  awayLineup?: Player[]
  isSampleData?: boolean
}

const convertToPlayerDetails = (lineup: any[], team: "home" | "away") => {
  return lineup.map((player, index) => {
    const nameParts = player.player?.split(" ") || ["Player", "Unknown"]
    const name = nameParts[0] || "Player"
    const surname = nameParts.slice(1).join(" ") || "Unknown"

    return {
      id: `${team}-player-${index}`,
      name,
      surname,
      position: player.position || "Unknown",
    }
  })
}

export default function Dashboard() {
  const router = useRouter()

  const [matches, setMatches] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingSampleData, setUsingSampleData] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [allGames, setAllGames] = useState<Game[]>([])
  const [activeTab, setActiveTab] = useState("upcoming-games")
  const {user}=useAuth()

  // Fetch matches data using the API client
  const fetchMatches = async () => {
    try {
      setIsLoading(true)
      setUsingSampleData(false)
      setDebugInfo("Fetching matches from API...")

      // 1️⃣ Get all matches
      const matchesData = await apiClient.getMatches()
      setDebugInfo(`Found ${matchesData?.length || 0} matches`)
      console.log(`the User who logged in while fetching games is ${user?.first_name} with id ${user?.last_name}`)
      if (matchesData && matchesData.length > 0) {
        // 2️⃣ Collect team IDs
        const teamIds = [
          ...new Set([...matchesData.map((m: Match) => m.home_team_id), ...matchesData.map((m: Match) => m.away_team_id)]),
        ]

        setDebugInfo(`Fetching ${teamIds.length} teams...`)

        // 3️⃣ Fetch all teams (for names + logos)
        const teamsData = await apiClient.getTeamsByIds(teamIds)

        // 4️⃣ Create a map team_id → team data
        const teamsMap = new Map()
        teamsData?.forEach((team: Team) => {
          teamsMap.set(team.team_id, team)
        })

        // 5️⃣ Format matches (NO players/lineups)
        const databaseGames: Game[] = matchesData.map((match: Match) => {
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
            homeTeam: {
              id: match.home_team_id,
              name: homeTeam.name || homeTeam.team_name || "Unknown Team",
              logo: homeTeam.icon_url || "/default_team.svg",
            },
            awayTeam: {
              id: match.away_team_id,
              name: awayTeam.name || awayTeam.team_name || "Unknown Team",
              logo: awayTeam.icon_url || "/default_team.svg",
            },
          }
        })

        setMatches(databaseGames)
        setAllGames([...databaseGames])
        setDebugInfo(`Successfully loaded ${databaseGames.length} games`)
      } else {
        console.log("No matches found in database")
        setUsingSampleData(true)
      }
    } catch (err: any) {
      console.error("Error fetching matches:", err)
      setError("Failed to load matches from database.")
      setMatches([])
      setUsingSampleData(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "upcoming-games":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <GamesGrid
              games={allGames.map((game) => ({
                ...game,
                homeLineup: convertToPlayerDetails(game.homeLineup || [], "home"),
                awayLineup: convertToPlayerDetails(game.awayLineup || [], "away"),
              }))}
            />
          </div>
        )
      case "booked-games":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Booked Games</h2>
              <p className="text-gray-300">This is where booked games for analysis will be shown</p>
            </div>
          </div>
        )
      case "live":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Live Matches</h2>
              <p className="text-gray-300">This is where live matches occur</p>
            </div>
          </div>
        )
      case "completed":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Completed Games</h2>
              <p className="text-gray-300">This is where completed games and their analysis will be displayed</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen">
      <AnalystSideNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <Image src="/bgr.jpg" alt="Background" fill priority className="object-cover" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen bg-black/30 backdrop-blur-sm">

        <DashboardHeader placeholder="Search players and teams..." />

       

        {/* Error message display */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6 pt-6">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-white mb-6">AVAILABLE GAMES</h2>
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
