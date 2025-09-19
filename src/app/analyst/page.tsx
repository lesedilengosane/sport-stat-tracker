// app/dashboard/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../landing.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../api/DatabaseApi/supabaseClient";
import { GamesGrid } from "@/components/games-grid";
import { apiClient } from "../utils/apiClient";
import { Player_details } from "@/app/analyst/column";
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton";
import { useAuth } from "../contexts/AuthContext"

// Define TypeScript interfaces based on your schema
interface Team {
  team_id: string;
  name: string;
  icon_url: string;
}

interface Match {
  match_id: string;
  match_date: string;
  location: string | null;
  home_score: number;
  away_score: number;
  status: string;
  home_team_id: string;
  away_team_id: string;
}

interface Player {
  player_id:string
  position: string;
  player: string;
  jerseyNumber?: number;
}

interface Game {
  match_id: string;
  date: string;
  time: string;
  location :string;
  homeTeam: { team_id: string; name: string; logo: string };
  awayTeam: { team_id: string; name: string; logo: string };
  homeLineup?: Player[];
  awayLineup?: Player[];
  isSampleData?: boolean;
}



const convertToPlayerDetails = (lineup: any[], team: "home" | "away") => {
  return lineup.map((player, index) => {
    const nameParts = player.player?.split(" ") || ["Player", "Unknown"];
    const name = nameParts[0] || "Player";
    const surname = nameParts.slice(1).join(" ") || "Unknown";

    return {
      id: `${team}-player-${index}`,
      name,
      surname,
      position: player.position || "Unknown",
    };
  });
};

export default function Dashboard() {
  const router = useRouter();
  
  const [matches, setMatches] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [allGames, setAllGames] = useState<Game[]>([]);
  const { userName, loading} = useAuth();


  

  // Fetch matches data using the API client
const fetchMatches = async () => {
  try {
    setIsLoading(true);
    setUsingSampleData(false);
    setDebugInfo("Fetching matches from API...");

    // 1️⃣ Get all matches
    const matchesData = await apiClient.getMatches();
    setDebugInfo(`Found ${matchesData?.length || 0} matches`);

    if (matchesData && matchesData.length > 0) {
      // 2️⃣ Collect team IDs
      const teamIds = [
        ...new Set([
          ...matchesData.map((m: any) => m.home_team_id),
          ...matchesData.map((m: any) => m.away_team_id),
        ]),
      ];

      setDebugInfo(`Fetching ${teamIds.length} teams...`);

      // 3️⃣ Fetch all teams (for names + logos)
      const teamsData = await apiClient.getTeamsByIds(teamIds);

      // 4️⃣ Create a map team_id → team data
      const teamsMap = new Map();
      teamsData?.forEach((team: any) => {
        teamsMap.set(team.team_id, team);
      });

      // 5️⃣ Format matches (NO players/lineups)
      const databaseGames: Game[] = matchesData.map((match: any) => {
        const homeTeam = teamsMap.get(match.home_team_id) || {};
        const awayTeam = teamsMap.get(match.away_team_id) || {};

        return {
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

      setMatches(databaseGames);
      setAllGames([...databaseGames]);
      setDebugInfo(`Successfully loaded ${databaseGames.length} games`);
    } else {
      console.log("No matches found in database");
      setUsingSampleData(true);
    }
  } catch (err: any) {
    console.error("Error fetching matches:", err);
    setError("Failed to load matches from database.");
    setMatches([]);
    setUsingSampleData(true);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchMatches();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };


  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/bgr.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Main content overlay with semi-transparent background and blur effect */}
      <div className="relative z-10 min-h-screen bg-black/30 backdrop-blur-sm">
        {/* Header section with search bar, user greeting, and profile icon */}
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto p-6 pt-16">
          {/* Search input field */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-80">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-white placeholder-white/70 outline-none flex-1"
            />
            
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* User greeting and profile icon */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-white">Hello, {userName}</span>
            <Link href="./analyst/profile">
              <Image
                src="/profile.jpg"
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full border-2 border-white shadow-md cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {/* Error message display */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Loading state indicator */}
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
          /* Games grid display when data is loaded */
          <div className="max-w-6xl mx-auto">
            <GamesGrid
              games={allGames.map((game) => ({
                ...game,
                homeLineup: convertToPlayerDetails(
                  game.homeLineup || [],
                  "home"
                ),
                awayLineup: convertToPlayerDetails(
                  game.awayLineup || [],
                  "away"
                ),
              }))}
            />
          </div>
        )}

        {/* Logout button */}
        <div className="mt-8 text-center pb-8">
          <button onClick={handleLogout} className={styles.btn}>
            Welcome to your Dashboard, {userName}! Click to log out
          </button>
        </div>
      </div>
    </div>
  );
}
