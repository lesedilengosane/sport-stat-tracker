// app/dashboard/page.tsx
"use client";

import Image from "next/image";
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
      console.log("Starting to fetch matches from API...");

      // Get all matches
      const matchesData = await apiClient.getMatches();
      console.log("Matches data from API:", matchesData);
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

        console.log("Team IDs to fetch:", teamIds);
        setDebugInfo(`Fetching ${teamIds.length} teams...`);

        // Fetch all teams
        const teamsData = await apiClient.getTeamsByIds(teamIds);
        console.log("Teams data from API:", teamsData);
        setDebugInfo(`Found ${teamsData?.length || 0} teams`);

        // Create a map of team_id to team data
        const teamsMap = new Map();
        teamsData?.forEach((team: Team) => {
          teamsMap.set(team.team_id, team);
        });

        console.log("Teams map size:", teamsMap.size);
        console.log("Teams map contents:", Array.from(teamsMap.entries()));

        // Format the data
        databaseGames = matchesData.map((match: any) => {
          const homeTeam = teamsMap.get(match.home_team_id) || {};
          const awayTeam = teamsMap.get(match.away_team_id) || {};

          console.log("Processing match:", match.match_id);
          console.log(
            "Home team ID:",
            match.home_team_id,
            "Team data:",
            homeTeam
          );
          console.log(
            "Away team ID:",
            match.away_team_id,
            "Team data:",
            awayTeam
          );

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
            isSampleData: false,
          };
        });

        console.log("Formatted matches data:", databaseGames);
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
      // If there's an error, just show sample data
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
    <div className={styles.container}>
      <Image
        src="/bgr.jpg"
        alt="Background"
        fill
        priority
        className={styles.bgImage}
      />

      <div className={styles.overlay}>
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto p-6 mb-8">
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

          <div className="flex items-center gap-3">
            <span className="text-sm text-white">Hello, {userName}</span>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Debug panel */}
        <div className="max-w-6xl mx-auto mb-4 p-3 bg-blue-900/30 rounded-lg">
          <div className="flex justify-between items-center">
            {/* <div>
              <h3 className="text-white font-bold text-sm">Database Status:</h3>
              <p className="text-white text-xs">
                {usingSampleData ? "Using sample data" : "Using database data"}{" "}
                | Database Games: {matches.length} | Sample Games:{" "}
                {sampleGames.length} | {debugInfo}
              </p>
            </div> */}
            {/* <div className="flex gap-2">
              <button
                onClick={testDatabaseConnection}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Test Connection
              </button>
              <button
                onClick={addTestData}
                className="bg-purple-600 text-white px-2 py-1 rounded text-xs"
              >
                Add Test Data
              </button>
              <button
                onClick={retryFetch}
                className="bg-green-600 text-white px-2 py-1 rounded text-xs"
              >
                Refresh Data
              </button>
            </div> */}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 max-w-6xl mx-auto">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-white">Loading games...</p>
          </div>
        ) : (
          <div>
            {/* <h2 className="text-xl font-bold text-white mb-4">
              Available Games ({allGames.length})
              <span className="text-sm font-normal ml-2">
                ({matches.length} from database, {sampleGames.length} sample
                games)
              </span>
            </h2> */}
            <GamesGrid games={allGames} />
          </div>
        )}

        <div className="mt-8 text-center">
          <button onClick={handleLogout} className={styles.btn}>
            Welcome to your Dashboard, {userName}! Click to log out
          </button>
        </div>
      </div>
    </div>
  );
}
