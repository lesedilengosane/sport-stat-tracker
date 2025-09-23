"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save } from "lucide-react"
import { Reserves } from "@/components/coachComponents/reserves"
import { CourtPlayer } from "@/components/coachComponents/courtPlayer"
import type { Player, CourtPosition } from "@/types/player"

const mockPlayers: Player[] = [
  {
    teamID: "LAL001",
    playerID: "P001",
    name: "DeAndre Ayton",
    position: "Center",
    isStarting: false,
    jerseyNumber: 32,
    profileImage: "/playerPictures/DeAndre.png",
    status: "fit",
  },
  {
    teamID: "LAL001",
    playerID: "P002",
    name: "Luka Dončić",
    position: "Point Guard",
    isStarting: false,
    jerseyNumber: 77,
    profileImage: "/playerPictures/Luka.jpeg",
    status: "fit",
  },
  {
    teamID: "LAL001",
    playerID: "P003",
    name: "Dalton Knecht",
    position: "Shooting Guard",
    isStarting: false,
    jerseyNumber: 44,
    profileImage: "/playerPictures/Dalton.png",
    status: "fit",
  },
  {
    teamID: "LAL001",
    playerID: "P004",
    name: "Austin Reaves",
    position: "Guard",
    isStarting: false,
    jerseyNumber: 15,
    profileImage: "/playerPictures/Austin.jpeg",
    status: "suspended",
  },
  {
    teamID: "LAL001",
    playerID: "P005",
    name: "Rui Hachimura",
    position: "Forward",
    isStarting: false,
    jerseyNumber: 28,
    profileImage: "/playerPictures/Rui.png",
    status: "fit",
  },
  { 
    teamID: "LAL001",
    playerID: "P006",
    name: "LeBron James", 
    position: "Forward", 
    isStarting: false,
    jerseyNumber: 23, 
    profileImage: "/playerPictures/LeBron.jpeg", 
    status: "fit" },
]

// Predefined court positions
const courtPositions: CourtPosition[] = [
  { id: "pg", x: 50, y: 85, label: "PG" }, // Point Guard
  { id: "sg", x: 25, y: 70, label: "SG" }, // Shooting Guard
  { id: "sf", x: 75, y: 70, label: "SF" }, // Small Forward
  { id: "pf", x: 35, y: 45, label: "PF" }, // Power Forward
  { id: "c", x: 65, y: 45, label: "C" }, // Center
]

export function TeamManagement() {
  const [reservePlayers, setReservePlayers] = useState<Player[]>(mockPlayers)
  const [courtPlayers, setCourtPlayers] = useState<Map<string, Player>>(new Map())

  const handleStatusChange = (playerId: string, status: Player["status"]) => {
    setReservePlayers((prev) => prev.map((player) => (player.playerID === playerId ? { ...player, status } : player)))
  }

  const handleAddPlayer = () => {
    console.log("Add player clicked")
    // TODO: Implement add player functionality
  }

  const handleSaveLineup = () => {
    const lineupData = {
      startingLineup: Array.from(courtPlayers.entries()).map(([positionId, player]) => ({
        teamID: player.teamID,
        playerID: player.playerID,
        position: positionId.toUpperCase(),
        isStarting: true,
        jerseyNumber: player.jerseyNumber,
      })),
      reserves: reservePlayers.map((player) => ({
        teamID: player.teamID,
        playerID: player.playerID,
        position: player.position,
        isStarting: false,
        jerseyNumber: player.jerseyNumber,
      })),
    }

    console.log("Team Lineup JSON:", JSON.stringify(lineupData, null, 2))

    const dataStr = JSON.stringify(lineupData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `team-lineup-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleDrop = (e: React.DragEvent, positionId: string) => {
    e.preventDefault()
    const playerData = e.dataTransfer.getData("application/json")
    const droppedPlayer: Player = JSON.parse(playerData)

    // Check if there's already a player at this position
    const existingPlayer = courtPlayers.get(positionId)

    if (existingPlayer) {
      // Swap players: move existing player back to reserves
      setReservePlayers((prev) => [...prev, existingPlayer])
    }

    // Remove player from reserves and add to court
    setReservePlayers((prev) => prev.filter((p) => p.playerID !== droppedPlayer.playerID))
    setCourtPlayers((prev) => new Map(prev.set(positionId, droppedPlayer)))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleCourtPlayerDragStart = (player: Player) => {
    // Remove player from court when dragging starts
    const positionId = Array.from(courtPlayers.entries()).find(([_, p]) => p.playerID === player.playerID)?.[0]

    if (positionId) {
      setCourtPlayers((prev) => {
        const newMap = new Map(prev)
        newMap.delete(positionId)
        return newMap
      })
      setReservePlayers((prev) => [...prev, player])
    }
  }

  return (
    <div className="max-w-full mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        <Button
          onClick={handleSaveLineup}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Save className="w-4 h-4" />
          Save Lineup
        </Button>
      </div>

      <div className="flex gap-6 h-[calc(130vh-160px)]">
        {/* Basketball Court - 70% */}
        <div className="flex-[7] relative">
          <Card className="h-full overflow-hidden bg-black/50 backdrop-blur-sm border-orange-500/20">
            <CardContent className="p-0 h-full relative">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat relative"
                style={{
                  backgroundImage: `url('/court/aerialView.png')`,
                }}
              >
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Drop Zones for Court Positions */}
                {courtPositions.map((position) => (
                  <div key={position.id}>
                    {/* Drop Zone */}
                    <div
                      className="absolute w-16 h-16 border-2 border-dashed border-orange-500/50 rounded-full bg-orange-500/10 hover:bg-orange-500/20 transition-colors z-10"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onDrop={(e) => handleDrop(e, position.id)}
                      onDragOver={handleDragOver}
                    />

                    <div
                      className="absolute text-white font-bold text-sm bg-black/80 px-2 py-1 rounded z-30 pointer-events-none"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y + 8}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {position.label}
                    </div>
                  </div>
                ))}

                {/* Players on Court */}
                {courtPositions.map((position) => {
                  const player = courtPlayers.get(position.id)
                  return player ? (
                    <CourtPlayer
                      key={`${position.id}-${player.playerID}`}
                      player={player}
                      position={{ x: position.x, y: position.y }}
                      onDragStart={handleCourtPlayerDragStart}
                    />
                  ) : null
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reserves Section - 30% */}
        <div className="flex-[3] h-full">
          <Reserves players={reservePlayers} onAddPlayer={handleAddPlayer} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  )
}
