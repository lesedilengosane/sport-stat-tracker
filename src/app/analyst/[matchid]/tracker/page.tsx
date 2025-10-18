// app/analyst/[matchid]/tracker/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BasketballStatTracker from "@/components/basketball-stat-tracker";
import type { GameData, Team, Player } from "@/types/basketball";
import { apiClient } from "@/app/utils/apiClient";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Loader2 } from "lucide-react";

export default function StatTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadGameData = async () => {
      try {
  
        setIsLoading(true)
        setError(null);

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
          console.warn("Failed to parse lineup data", parseError);
        }

        const formatPlayers = (
          players: any[],
          teamId: string,
          teamPrefix: string
        ): Player[] => {
          if (!Array.isArray(players)) return [];
          return players.map((player, index) => ({
            player_id: player?.id || `${teamPrefix}-player-${index + 1}`,
            team_id: teamId,
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
            color: "blue",
            score: 0,
            timeouts: 0,
            fouls: 0,
            players: formatPlayers(homeLineup, homeTeamId, "home"),
            logo: homeLogo,
          },
          awayTeam: {
            team_id: awayTeamId,
            name: awayTeamName,
            color: "red",
            score: 0,
            timeouts: 0,
            fouls: 0,
            players: formatPlayers(awayLineup, awayTeamId, "away"),
            logo: awayLogo,
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
    setIsSaving(true);
    const dataStr = JSON.stringify(completeGameData, null, 2);
    const response = await apiClient.SaveGameData(completeGameData);

    if (response.status === 200) {
      // ✅ Trigger download immediately
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `game-stats-${completeGameData.homeTeam.name}-vs-${completeGameData.awayTeam.name}-${new Date()
        .toISOString()
        .split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // ✅ Show toast simultaneously
      toast.success("Game saved! Download started.", {
        description: "Navigating to Analyst page...",
      });

      // ✅ Immediately navigate / reload page
      window.location.href = "/analyst"; // or router.push("/analyst")
    } else {
      toast.error("Failed to save game data", {
        description: response.error || "Unknown error",
      });
    }
  } catch (error: any) {
    console.error("Failed to save game:", error);
    toast.error("Error while saving game data", {
      description: error?.message || "Something went wrong.",
    });
  } finally {
    setIsSaving(false);
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
    <>
      {/* Main tracker content */}
      <BasketballStatTracker
        gameData={gameData}
        onBack={() => router.back()}
        onSave={handleSaveGame}
      />

      {/* Inline modal with spinner */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-700 font-medium">
              Saving your game data...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
