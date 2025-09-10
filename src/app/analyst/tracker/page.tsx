
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BasketballStatTracker from "@/components/basketball-stat-tracker"
import type { GameData } from "@/types/basketball"

export default function StatTrackerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gameData, setGameData] = useState<GameData | null>(null)

  const fetchGameData = async (gameId?: string): Promise<GameData> => {
    // Mock game data - in real app, this would come from your database
    return {
      id: gameId || "game-001",
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      homeTeam: {
        id: "lakers",
        name: "Los Angeles Lakers",
        color: "blue",
        score: 0,
        timeouts: 0,
        fouls: 0,
        players: [
          { id: "lakers-1", name: "LeBron James", position: "SF", jerseyNumber: 6 },
          { id: "lakers-2", name: "Anthony Davis", position: "PF", jerseyNumber: 3 },
          { id: "lakers-3", name: "Russell Westbrook", position: "PG", jerseyNumber: 0 },
          { id: "lakers-4", name: "Austin Reaves", position: "SG", jerseyNumber: 15 },
          { id: "lakers-5", name: "Thomas Bryant", position: "C", jerseyNumber: 13 },
        ],
      },
      awayTeam: {
        id: "warriors",
        name: "Golden State Warriors",
        color: "red",
        score: 0,
        timeouts: 0,
        fouls: 0,
        players: [
          { id: "warriors-1", name: "Stephen Curry", position: "PG", jerseyNumber: 30 },
          { id: "warriors-2", name: "Klay Thompson", position: "SG", jerseyNumber: 11 },
          { id: "warriors-3", name: "Andrew Wiggins", position: "SF", jerseyNumber: 22 },
          { id: "warriors-4", name: "Draymond Green", position: "PF", jerseyNumber: 23 },
          { id: "warriors-5", name: "Kevon Looney", position: "C", jerseyNumber: 5 },
        ],
      },
      status: "live",
      location: "Crypto.com Arena",
    }
  }

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const gameId = searchParams.get("gameId")
        const data = await fetchGameData(gameId || undefined)
        setGameData(data)
      } catch (error) {
        console.error("Failed to load game data:", error)
        // Handle error - could show error message or redirect
      }
    }

    loadGameData()
  }, [searchParams])









  const handleSaveGame = async (completeGameData: any) => {
    try {
      const dataStr = JSON.stringify(completeGameData, null, 2)
      //Need to send a post request to the matchID with this body
      
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `game-stats-${completeGameData.homeTeam.name}-vs-${completeGameData.awayTeam.name}-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      alert("Game data downloaded successfully!")
    } catch (error) {
      console.error("Failed to save game:", error)
      alert("Failed to download game data. Please try again.")
    }
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load game data</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <BasketballStatTracker gameData={gameData} onBack={() => router.back()} onSave={handleSaveGame} />
}