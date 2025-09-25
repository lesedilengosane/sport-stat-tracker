// app/analyst/[matchid]/tracker/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BasketballStatTracker from "@/components/basketball-stat-tracker";
import type { GameData, Team, Player } from "@/types/basketball";

export default function StatTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            player_id: player?.id
              ? `${teamId}-${player.id}`
              : `${teamId}-${teamPrefix}-player-${index + 1}`,
            name: player?.name || `Player ${index + 1}`,
            position: player?.position || "Unknown",
            jerseyNumber: player?.jerseyNumber || index + 1,
          }));
        };

        const gameData: GameData = {
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
      const dataStr = JSON.stringify(completeGameData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `game-stats-${completeGameData.homeTeam.name}-vs-${
        completeGameData.awayTeam.name
      }-${new Date().toISOString().split("T")[0]}.json`;

      // Proper DOM manipulation for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Game data downloaded successfully!");
    } catch (error) {
      console.error("Failed to save game:", error);
      alert("Failed to download game data. Please try again.");
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
