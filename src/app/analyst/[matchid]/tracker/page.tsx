// app/analyst/[matchid]/tracker/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BasketballStatTracker from "@/components/basketball-stat-tracker";
import type { GameData, Team, Player } from "@/types/basketball";
import { apiClient } from "@/app/utils/apiClient";
import { useAuth } from "@/app/context/AuthContext";

export default function StatTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user}=useAuth()



  //This is gonna be the body I am using to test
  const test_body={
  "date": "2025/09/04 18:00:00",
  "season": "2025",
  "location": "Wits Basketball court",
  "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
  "homeTeam": {
    "teamid": "73b4b864-1a12-4dca-a0c3-015714264ebe",
    "name": "Los Angeles Lakers",
    "score": 18,
    "players": [
      {
        "id": "lakers-1",
        "name": "LeBron James",
        "position": "SF",
        "jerseyNumber": 6,
        "stats": {
          "player_id": "19d3eed6-5512-4947-9f17-f64fad1b1a82",
          "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
          "points": 8,
          "assists": 4,
          "rebounds": 5,
          "steals": 1,
          "blocks": 1,
          "turnovers": 2,
          "fouls": 2,
          "twoPointsMade": 3,
          "twoPointsAttempted": 6,
          "threePointsMade": 0,
          "threePointsAttempted": 2,
          "freeThrowsMade": 2,
          "freeThrowsAttempted": 3
        }
      },
      {
        "id": "lakers-2",
        "name": "Anthony Davis",
        "position": "PF",
        "jerseyNumber": 3,
        "stats": {
          "player_id": "96653c15-df79-4cf1-9cdb-74a04d802d58",
          "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
          "points": 6,
          "assists": 1,
          "rebounds": 7,
          "steals": 0,
          "blocks": 2,
          "turnovers": 1,
          "fouls": 3,
          "twoPointsMade": 3,
          "twoPointsAttempted": 5,
          "threePointsMade": 0,
          "threePointsAttempted": 0,
          "freeThrowsMade": 0,
          "freeThrowsAttempted": 2
        }
      },
      {
        "id": "lakers-3",
        "name": "Russell Westbrook",
        "position": "PG",
        "jerseyNumber": 0,
        "stats": {
          "player_id": "32eabf35-72fc-40c8-b59b-89362ef8685b",
          "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
          "points": 4,
          "assists": 2,
          "rebounds": 3,
          "steals": 1,
          "blocks": 0,
          "turnovers": 2,
          "fouls": 1,
          "twoPointsMade": 2,
          "twoPointsAttempted": 7,
          "threePointsMade": 0,
          "threePointsAttempted": 1,
          "freeThrowsMade": 0,
          "freeThrowsAttempted": 0
        }
      }
    ]
  },
  "awayTeam": {
    "teamid": "9fd0c4f4-c9c0-4312-a124-17a22398dd0d",
    "name": "Golden State Warriors",
    "score": 26,
    "players": [
      {
        "id": "warriors-1",
        "name": "Stephen Curry",
        "position": "PG",
        "jerseyNumber": 30,
        "stats": {
          "player_id": "4d390c88-758e-4fef-ade1-b698fcd20cf0",
          "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
          "points": 12,
          "assists": 5,
          "rebounds": 2,
          "steals": 1,
          "blocks": 0,
          "turnovers": 1,
          "fouls": 1,
          "twoPointsMade": 2,
          "twoPointsAttempted": 3,
          "threePointsMade": 2,
          "threePointsAttempted": 5,
          "freeThrowsMade": 2,
          "freeThrowsAttempted": 2
        }
      },
      {
        "id": "warriors-2",
        "name": "Klay Thompson",
        "position": "SG",
        "jerseyNumber": 11,
        "stats": {
          "player_id": "a1b2c3d4-1111-4444-aaaa-000000000001",
          "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
          "points": 10,
          "assists": 2,
          "rebounds": 3,
          "steals": 0,
          "blocks": 1,
          "turnovers": 0,
          "fouls": 2,
          "twoPointsMade": 2,
          "twoPointsAttempted": 4,
          "threePointsMade": 2,
          "threePointsAttempted": 6,
          "freeThrowsMade": 0,
          "freeThrowsAttempted": 0
        }
      },
      {
        "id": "warriors-3",
        "name": "Andrew Wiggins",
        "position": "SF",
        "jerseyNumber": 22,
        "stats": {
          "player_id": "b1c2d3e4-2222-5555-bbbb-000000000004",
          "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
          "points": 4,
          "assists": 0,
          "rebounds": 4,
          "steals": 1,
          "blocks": 1,
          "turnovers": 1,
          "fouls": 1,
          "twoPointsMade": 2,
          "twoPointsAttempted": 3,
          "threePointsMade": 0,
          "threePointsAttempted": 2,
          "freeThrowsMade": 0,
          "freeThrowsAttempted": 0
        }
      }
    ]
  },
  "events": [
    {
      "id": "1757189272875",
      "created_at": "2025-09-10T22:07:52Z",
      "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
      "player_id": "19d3eed6-5512-4947-9f17-f64fad1b1a82",
      "team_id": "73b4b864-1a12-4dca-a0c3-015714264ebe",
      "action": "Foul",
      "points": 0
    },
    {
      "id": "1757189235656",
      "created_at": "2025-09-10T22:07:15Z",
      "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
      "player_id": "96653c15-df79-4cf1-9cdb-74a04d802d58",
      "team_id": "73b4b864-1a12-4dca-a0c3-015714264ebe",
      "action": "Steal",
      "points": 0
    },
    {
      "id": "1757189232100",
      "created_at": "2025-09-10T22:07:12Z",
      "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
      "player_id": "32eabf35-72fc-40c8-b59b-89362ef8685b",
      "team_id": "73b4b864-1a12-4dca-a0c3-015714264ebe",
      "action": "Block",
      "points": 0
    },
    {
      "id": "1757189240001",
      "created_at": "2025-09-10T22:08:05Z",
      "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
      "player_id": "4d390c88-758e-4fef-ade1-b698fcd20cf0",
      "team_id": "9fd0c4f4-c9c0-4312-a124-17a22398dd0d",
      "action": "TwoPointer",
      "points": 2
    },
    {
      "id": "1757189240002",
      "created_at": "2025-09-10T22:08:15Z",
      "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
      "player_id": "a1b2c3d4-1111-4444-aaaa-000000000001",
      "team_id": "9fd0c4f4-c9c0-4312-a124-17a22398dd0d",
      "action": "ThreePointer",
      "points": 3
    },
    {
      "id": "1757189240003",
      "created_at": "2025-09-10T22:08:25Z",
      "match_id": "3f4186f2-fda5-4bd8-9b25-3409efc6b7fd",
      "player_id": "b1c2d3e4-2222-5555-bbbb-000000000004",
      "team_id": "9fd0c4f4-c9c0-4312-a124-17a22398dd0d",
      "action": "Block",
      "points": 0
    }
  ],
  "finalScore": "18-26"
}
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all parameters from URL
        const gameId = searchParams.get("gameId") || "game-001";
        const date =
          searchParams.get("date") ||
          new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        const homeTeamId = searchParams.get("homeTeamId") || "home-team";
        const awayTeamId = searchParams.get("awayTeamId") || "away-team";
        const homeTeamName = searchParams.get("homeTeam") || "Home Team";
        const awayTeamName = searchParams.get("awayTeam") || "Away Team";
        const homeLogo = searchParams.get("homeLogo") || "/placeholder.svg";
        const awayLogo = searchParams.get("awayLogo") || "/placeholder.svg";

        // Parse lineup data safely
        let homeLineup: any[] = [];
        let awayLineup: any[] = [];

        try {
          const homeLineupParam = searchParams.get("homeLineup");
          const awayLineupParam = searchParams.get("awayLineup");

          if (homeLineupParam) {
            homeLineup = JSON.parse(decodeURIComponent(homeLineupParam));
          }
          if (awayLineupParam) {
            awayLineup = JSON.parse(decodeURIComponent(awayLineupParam));
          }
        } catch (parseError) {
          console.warn(
            "Failed to parse lineup data, using empty lineups",
            parseError
          );
        }

        // Convert lineup data to the format expected by BasketballStatTracker
        const formatPlayers = (
  players: any[],
  teamId: string,
  teamPrefix: string
): Player[] => {
  if (!Array.isArray(players)) return [];

  return players.map((player, index) => ({
    // Use the actual player.id if it exists, otherwise fallback to a safe generated ID
    player_id: player?.id || `${teamPrefix}-player-${index + 1}`,
    team_id: teamId,             // Keep teamId separate
    name: player?.name || `Player ${index + 1}`,
    position: player?.position || "Unknown",
    jerseyNumber: player?.jerseyNumber || index + 1,
  }));
};

        const gameData: GameData = {
          analyst: user?.auth_user_id ?? "",
          match_id: gameId,
          date: date,
          homeTeam: {
            team_id: homeTeamId,
            name: homeTeamName,
            //logo: homeLogo,
            color: "blue",
            score: 0,
            timeouts: 0,
            fouls: 0,
            players: formatPlayers(homeLineup, homeTeamId, "home"),
            logo: homeLogo
          },
          awayTeam: {
            team_id: awayTeamId,
            name: awayTeamName,
            //logo: awayLogo,
            color: "red",
            score: 0,
            timeouts: 0,
            fouls: 0,
            players: formatPlayers(awayLineup, awayTeamId, "away"),
            logo: awayLogo
          },
          status: "live",
          location: searchParams.get("location") || "Court",
        };

        setGameData(gameData);
      } catch (error) {
        console.error("Failed to load game data:", error);
        setError("Failed to load game data from URL parameters");

      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [searchParams]);

  const handleSaveGame = async (completeGameData: any) => {
  try {
    // 1️⃣ Convert to JSON string for download
    const dataStr = JSON.stringify(completeGameData, null, 2);

    // 2️⃣ Post to backend
    const response = await apiClient.SaveGameData(completeGameData);

    // 3️⃣ Check server response
    if (response.status === 200) {
      alert("The game data was saved successfully!");

      // 4️⃣ Download JSON locally
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `game-stats-${completeGameData.homeTeam.name}-vs-${completeGameData.awayTeam.name}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Game data downloaded successfully!");

      window.location.href = "/analyst";
    } else {
      alert(`Something failed while saving game data: ${response.error || "Unknown error"}`);
    }
  } catch (error: any) {
    console.error("Failed to save game:", error);
    alert(`Failed to save or download game data. ${error?.message || ""}`);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error && !gameData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No game data available</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <BasketballStatTracker
      gameData={gameData}
      onBack={() => router.back()}
      onSave={handleSaveGame}
    />
  );
}
