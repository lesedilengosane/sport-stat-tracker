// app/analyst/page.tsx
"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { supabase } from "../api/DatabaseApi/supabaseClient"
import { GamesGrid } from "@/components/games-grid"
import { apiClient } from "../utils/apiClient"
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton"
import { useAuth } from "../context/AuthContext"
import { AnalystSideNav } from "@/components/sideNav/analystSideNav"
import { DashboardHeader } from "@/components/header/header"
import { CompletedGamesGrid } from "@/components/completed-games-grid"
import { Game,Match } from "@/types/basketball"

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
    const hasFetched = useRef(false)
  const gamesCache = useRef<Game[] | null>(null)

const fetchMatches = async () => {
  try {
    setIsLoading(true);
    setError(null);
    setUsingSampleData(false);

    // 1️⃣ Try sessionStorage first
    const cachedGames = sessionStorage.getItem("matches");
    if (cachedGames) {
      const parsedGames: Game[] = JSON.parse(cachedGames);
      gamesCache.current = parsedGames;
      hasFetched.current = true;
      setAllGames(parsedGames);
      setMatches(parsedGames);
      setDebugInfo(`Loaded ${parsedGames.length} games from sessionStorage`);
      return;
    }

    // 2️⃣ If not in sessionStorage, check in-memory cache
    if (hasFetched.current && gamesCache.current) {
      setAllGames(gamesCache.current);
      setMatches(gamesCache.current);
      setDebugInfo(`Loaded ${gamesCache.current.length} games from memory cache`);
      return;
    }

    // 3️⃣ Fetch from API
    const matchesData = await apiClient.getMatches();

    if (!matchesData || matchesData.length === 0) {
      setUsingSampleData(true);
      setDebugInfo("No matches found in database");
      return;
    }

    const teamIds = [
      ...new Set([
        ...matchesData.map((m: { home_team_id: any }) => m.home_team_id),
        ...matchesData.map((m: { away_team_id: any }) => m.away_team_id),
      ]),
    ];

    const teamsData = await apiClient.getTeamsByIds(teamIds);
    const teamsMap = new Map();
    teamsData?.forEach((team: { team_id: any }) => teamsMap.set(team.team_id, team));

    const databaseGames: Game[] = matchesData.map((match: { home_team_id: any; away_team_id: any; match_id: any; analyst: any; completed: any; booked: any; away_score: any; home_score: any; location: any; match_date: string | number | Date }) => {
      const homeTeam = teamsMap.get(match.home_team_id) || {};
      const awayTeam = teamsMap.get(match.away_team_id) || {};

      return {
        match_id: match.match_id,
        analyst: match.analyst,
        completed: match.completed,
        booked: match.booked,
        away_score: match.away_score,
        home_score: match.home_score,
        location: match.location,
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
      };
    });

    // 4️⃣ Cache in memory and sessionStorage
    gamesCache.current = databaseGames;
    hasFetched.current = true;
    sessionStorage.setItem("matches", JSON.stringify(databaseGames));

    setAllGames(databaseGames);
    setMatches(databaseGames);
    setDebugInfo(`Successfully loaded ${databaseGames.length} games from API`);
  } catch (err) {
    console.error("Error fetching matches:", err);
    setError("Failed to load matches from database.");
  } finally {
    setIsLoading(false);
  }
};

// ---------- Fetch only once ----------
useEffect(() => {
  if (!user) return; // wait until user is ready
  fetchMatches();
}, [user]);
//filter upcoming games that have not been played from all games

const upcomingGames=allGames.filter((game)=>game.completed==false)

//filter completed games
  const completedGames= allGames.filter(
      (game) => game.completed ==true &&
        game.analyst === user?.auth_user_id
    )
    

const bookedGames = allGames.filter(
  (game) =>
    game.booked === true &&
    game.completed === false &&
    game.analyst === user?.auth_user_id
);

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
              games={upcomingGames.map((game) => ({
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
      <GamesGrid
        games={bookedGames.map((game) => ({
          ...game,
          homeLineup: convertToPlayerDetails(game.homeLineup || [], "home"),
          awayLineup: convertToPlayerDetails(game.awayLineup || [], "away"),
        }))}
      />
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
        <CompletedGamesGrid
        games={completedGames.map((game) => ({
          ...game,
          homeTeam: {
            ...game.homeTeam,
            color: "#000000",  // Add default values
            score: game.home_score || 0,
            timeouts: 0,
            fouls: 0,
            players: convertToPlayerDetails(game.homeLineup || [], "home")
          },
          awayTeam: {
            ...game.awayTeam,
            color: "#000000",  // Add default values
            score: game.away_score || 0,
            timeouts: 0,
            fouls: 0,
            players: convertToPlayerDetails(game.awayLineup || [], "away")
          },
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
      <AnalystSideNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Background image */}
      <div className="fixed inset-0 z-0">

        <Image src="/background/orangebackground.jpeg" alt="Background" fill priority className="object-cover" />
     
        {/*Overlay */}   
        <div className="absolute inset-0 bg-white/40 backdrop-blur-lg"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <div className="sticky top-0 z-20 bg-transparent">
          <DashboardHeader placeholder="Search players and teams..." />
        </div> 

        {/* Error message display */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6 pt-6">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-black mb-6 mt-6">AVAILABLE GAMES</h2>
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
