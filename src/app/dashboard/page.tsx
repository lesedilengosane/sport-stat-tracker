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
  position: string;
  player: string;
  jerseyNumber?: number;
}

interface Game {
  id: string;
  date: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  homeLineup?: Player[];
  awayLineup?: Player[];
  isSampleData?: boolean;
}

// Sample game data - fallback if database is empty
const sampleGames: Game[] = [
  {
    id: "sample-1",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
    homeLineup: [
      { position: "PG", player: "D'Angelo Russell", jerseyNumber: 1 },
      { position: "SG", player: "Austin Reaves", jerseyNumber: 15 },
      { position: "SF", player: "Rui Hachimura", jerseyNumber: 28 },
      { position: "PF", player: "LeBron James", jerseyNumber: 23 },
      { position: "C", player: "Anthony Davis", jerseyNumber: 3 },
    ],
    awayLineup: [
      { position: "PG", player: "Stephen Curry", jerseyNumber: 30 },
      { position: "SG", player: "Klay Thompson", jerseyNumber: 11 },
      { position: "SF", player: "Andrew Wiggins", jerseyNumber: 22 },
      { position: "PF", player: "Draymond Green", jerseyNumber: 23 },
      { position: "C", player: "Kevon Looney", jerseyNumber: 5 },
    ],
    isSampleData: true,
  },
  {
    id: "sample-2",
    date: "12 September 2025",
    homeTeam: {
      name: "Heat",
      logo: "/Miami_Heat.svg",
    },
    awayTeam: {
      name: "Mavs",
      logo: "/Dallas_Mavericks.svg",
    },
    homeLineup: [
      { position: "PG", player: "Kyle Lowry", jerseyNumber: 7 },
      { position: "SG", player: "Tyler Herro", jerseyNumber: 14 },
      { position: "SF", player: "Jimmy Butler", jerseyNumber: 22 },
      { position: "PF", player: "Kevin Love", jerseyNumber: 42 },
      { position: "C", player: "Bam Adebayo", jerseyNumber: 13 },
    ],
    awayLineup: [
      { position: "PG", player: "Luka Dončić", jerseyNumber: 77 },
      { position: "SG", player: "Kyrie Irving", jerseyNumber: 11 },
      { position: "SF", player: "Tim Hardaway Jr.", jerseyNumber: 10 },
      { position: "PF", player: "Grant Williams", jerseyNumber: 33 },
      { position: "C", player: "Dereck Lively II", jerseyNumber: 2 },
    ],
    isSampleData: true,
  },
  {
    id: "sample-3",
    date: "12 September 2025",
    homeTeam: {
      name: "Nets",
      logo: "/Brooklyn_Nets.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
    homeLineup: [
      { position: "PG", player: "Ben Simmons", jerseyNumber: 10 },
      { position: "SG", player: "Mikal Bridges", jerseyNumber: 1 },
      { position: "SF", player: "Cameron Johnson", jerseyNumber: 2 },
      { position: "PF", player: "Dorian Finney-Smith", jerseyNumber: 28 },
      { position: "C", player: "Nic Claxton", jerseyNumber: 33 },
    ],
    awayLineup: [
      { position: "PG", player: "Stephen Curry", jerseyNumber: 30 },
      { position: "SG", player: "Klay Thompson", jerseyNumber: 11 },
      { position: "SF", player: "Andrew Wiggins", jerseyNumber: 22 },
      { position: "PF", player: "Draymond Green", jerseyNumber: 23 },
      { position: "C", player: "Kevon Looney", jerseyNumber: 5 },
    ],
    isSampleData: true,
  },
  {
    id: "sample-4",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
    homeLineup: [
      { position: "PG", player: "D'Angelo Russell", jerseyNumber: 1 },
      { position: "SG", player: "Austin Reaves", jerseyNumber: 15 },
      { position: "SF", player: "Rui Hachimura", jerseyNumber: 28 },
      { position: "PF", player: "LeBron James", jerseyNumber: 23 },
      { position: "C", player: "Anthony Davis", jerseyNumber: 3 },
    ],
    awayLineup: [
      { position: "PG", player: "Stephen Curry", jerseyNumber: 30 },
      { position: "SG", player: "Klay Thompson", jerseyNumber: 11 },
      { position: "SF", player: "Andrew Wiggins", jerseyNumber: 22 },
      { position: "PF", player: "Draymond Green", jerseyNumber: 23 },
      { position: "C", player: "Kevon Looney", jerseyNumber: 5 },
    ],
    isSampleData: true,
  },
  {
    id: "sample-5",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
    homeLineup: [
      { position: "PG", player: "D'Angelo Russell", jerseyNumber: 1 },
      { position: "SG", player: "Austin Reaves", jerseyNumber: 15 },
      { position: "SF", user: "Rui Hachimura", jerseyNumber: 28 },
      { position: "PF", player: "LeBron James", jerseyNumber: 23 },
      { position: "C", player: "Anthony Davis", jerseyNumber: 3 },
    ],
    awayLineup: [
      { position: "PG", player: "Stephen Curry", jerseyNumber: 30 },
      { position: "SG", player: "Klay Thompson", jerseyNumber: 11 },
      { position: "SF", player: "Andrew Wiggins", jerseyNumber: 22 },
      { position: "PF", player: "Draymond Green", jerseyNumber: 23 },
      { position: "C", player: "Kevon Looney", jerseyNumber: 5 },
    ],
    isSampleData: true,
  },
  {
    id: "sample-6",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
    homeLineup: [
      { position: "PG", player: "D'Angelo Russell", jerseyNumber: 1 },
      { position: "SG", player: "Austin Reaves", jerseyNumber: 15 },
      { position: "SF", player: "Rui Hachimura", jerseyNumber: 28 },
      { position: "PF", player: "LeBron James", jerseyNumber: 23 },
      { position: "C", player: "Anthony Davis", jerseyNumber: 3 },
    ],
    awayLineup: [
      { position: "PG", player: "Stephen Curry", jerseyNumber: 30 },
      { position: "SG", player: "Klay Thompson", jerseyNumber: 11 },
      { position: "SF", player: "Andrew Wiggins", jerseyNumber: 22 },
      { position: "PF", player: "Draymond Green", jerseyNumber: 23 },
      { position: "C", player: "Kevon Looney", jerseyNumber: 5 },
    ],
    isSampleData: true,
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [matches, setMatches] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [allGames, setAllGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        setError("Failed to fetch user information");
        return;
      }

      if (user) {
        const fullName = user.user_metadata?.full_name || user.email || "User";
        setUserName(fullName.split(" ")[0]);
      } else {
        router.push("/");
      }
    };

    fetchUser();
  }, [router]);

  // Function to add test teams and a match
  const addTestData = async () => {
    try {
      setDebugInfo("Adding test data...");
      console.log("Adding test data...");

      // First, check if we already have test teams
      const teams = await apiClient.getTeams();
      const existingTeams = teams.filter(
        (team: Team) =>
          team.name === "Test Team A" || team.name === "Test Team B"
      );

      let homeTeamId, awayTeamId;

      if (existingTeams && existingTeams.length >= 2) {
        // Use existing test teams
        homeTeamId = existingTeams[0].team_id;
        awayTeamId = existingTeams[1].team_id;
        setDebugInfo("Using existing test teams");
      } else {
        // Create test teams
        const testTeamA = {
          name: "Test Team A",
          icon_url: "/default_team.svg",
        };

        const testTeamB = {
          name: "Test Team B",
          icon_url: "/default_team.svg",
        };

        const teamAData = await apiClient.createTeam(testTeamA);
        const teamBData = await apiClient.createTeam(testTeamB);

        homeTeamId = teamAData.team_id;
        awayTeamId = teamBData.team_id;
        setDebugInfo("Created new test teams");
      }

      // Create a test match
      const testMatch = {
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: new Date().toISOString(),
        location: "Test Arena",
        home_score: 95,
        away_score: 88,
        season: "2025",
        status: "completed",
      };

      await apiClient.createMatch(testMatch);
      setDebugInfo("Test match created successfully!");

      // Now try to fetch the data again
      retryFetch();
    } catch (err: any) {
      console.error("Error adding test data:", err);
      setDebugInfo(`Error: ${err.message}`);
      setError("Failed to add test data. Check console for details.");
    }
  };

  // Fetch matches data using the API client
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setUsingSampleData(false);
      setDebugInfo("Fetching matches from API...");

      // Get all matches
      const matchesData = await apiClient.getMatches();
      setDebugInfo(`Found ${matchesData?.length || 0} matches`);

      let databaseGames: Game[] = [];

      if (matchesData && matchesData.length > 0) {
        // Get all unique team IDs from the matches
        const teamIds = [
          ...new Set([
            ...matchesData.map((m: any) => m.home_team_id),
            ...matchesData.map((m: any) => m.away_team_id),
          ]),
        ];

        setDebugInfo(`Fetching ${teamIds.length} teams and players...`);

        // Fetch all teams
        const teamsData = await apiClient.getTeamsByIds(teamIds);

        // Fetch all players for these teams
        const playersMap = await apiClient.getPlayersByTeamIds(teamIds);

        // Create a map of team_id to team data
        const teamsMap = new Map();
        teamsData?.forEach((team: Team) => {
          teamsMap.set(team.team_id, team);
        });

        // Format the data
        databaseGames = await Promise.all(
          matchesData.map(async (match: any) => {
            const homeTeam = teamsMap.get(match.home_team_id) || {};
            const awayTeam = teamsMap.get(match.away_team_id) || {};

            // Get players for each team
            const homePlayers = playersMap.get(match.home_team_id) || [];
            const awayPlayers = playersMap.get(match.away_team_id) || [];

            // Format lineup data - get first 5 players for each team
            const homeLineup = homePlayers.slice(0, 5).map((player: any) => ({
              position: player.position,
              player: `${player.first_name} ${player.last_name}`,
              jerseyNumber: player.jersey_number,
            }));

            const awayLineup = awayPlayers.slice(0, 5).map((player: any) => ({
              position: player.position,
              player: `${player.first_name} ${player.last_name}`,
              jerseyNumber: player.jersey_number,
            }));

            return {
              id: match.match_id,
              date: new Date(match.match_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              homeTeam: {
                name: homeTeam.name || homeTeam.team_name || "Unknown Team",
                logo: homeTeam.icon_url || "/default_team.svg",
              },
              awayTeam: {
                name: awayTeam.name || awayTeam.team_name || "Unknown Team",
                logo: awayTeam.icon_url || "/default_team.svg",
              },
              homeLineup:
                homeLineup.length > 0
                  ? homeLineup
                  : [
                      {
                        position: "Guard",
                        player: "Starting Guard",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Guard",
                        player: "Starting Guard",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Forward",
                        player: "Starting Forward",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Forward",
                        player: "Starting Forward",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Center",
                        player: "Starting Center",
                        jerseyNumber: 0,
                      },
                    ],
              awayLineup:
                awayLineup.length > 0
                  ? awayLineup
                  : [
                      {
                        position: "Guard",
                        player: "Starting Guard",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Guard",
                        player: "Starting Guard",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Forward",
                        player: "Starting Forward",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Forward",
                        player: "Starting Forward",
                        jerseyNumber: 0,
                      },
                      {
                        position: "Center",
                        player: "Starting Center",
                        jerseyNumber: 0,
                      },
                    ],
              isSampleData: false,
            };
          })
        );

        setMatches(databaseGames);
        setDebugInfo(
          `Successfully loaded ${databaseGames.length} games from database`
        );
      } else {
        console.log("No matches found in database");
        setUsingSampleData(true);
      }

      // Combine database games with sample games
      setAllGames([...databaseGames, ...sampleGames]);
    } catch (err: any) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches from database. Using sample data.");
      setMatches([]);
      setUsingSampleData(true);
      setAllGames(sampleGames);
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

  const retryFetch = () => {
    setError(null);
    setIsLoading(true);
    // Refetch matches after a short delay
    setTimeout(() => {
      fetchMatches();
    }, 500);
  };

  // Test function to check database connection
  const testDatabaseConnection = async () => {
    try {
      console.log("Testing database connection...");
      setDebugInfo("Testing database connection...");

      // Test matches table
      const matchesData = await apiClient.getMatches();
      console.log("Matches data:", matchesData);
      setDebugInfo(`Matches: ${matchesData?.length || 0} records`);

      // Test teams table
      const teamsData = await apiClient.getTeams();
      console.log("Teams data:", teamsData);
      setDebugInfo(`Teams: ${teamsData?.length || 0} records`);
    } catch (err: any) {
      console.error("Database test error:", err);
      setDebugInfo(`Test error: ${err.message}`);
    }
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
            <Link href="../dashboard/profile">
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-white">Loading games...</p>
          </div>
        ) : (
          /* Games grid display when data is loaded */
          <div className="max-w-6xl mx-auto">
            <GamesGrid games={allGames} />
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
