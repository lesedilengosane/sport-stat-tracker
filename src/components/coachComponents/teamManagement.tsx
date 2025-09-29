"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save } from "lucide-react"
import { Reserves } from "@/components/coachComponents/reserves"
import { CourtPlayer } from "@/components/coachComponents/courtPlayer"
import type { Player, CourtPosition } from "@/types/player"
import { getDefaultLineup } from "@/app/utils/lineups"
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Predefined court positions
const courtPositions: CourtPosition[] = [
  { id: "pg", x: 50, y: 85, label: "PG" },
  { id: "sg", x: 25, y: 70, label: "SG" },
  { id: "sf", x: 75, y: 70, label: "SF" },
  { id: "pf", x: 35, y: 45, label: "PF" },
  { id: "c", x: 65, y: 45, label: "C" },
]

interface UnassignedPlayer {
  player_id: string
  first_name: string
  last_name: string
  position: string
  jersey_number: number
  team_id: string | null
}

interface TeamManagementProps {
  coachTeamId: string
}

// Custom Court Player Component with Name Display
const CustomCourtPlayer = ({ 
  player, 
  position, 
  onDragStart 
}: { 
  player: Player
  position: { x: number; y: number }
  onDragStart: (player: Player) => void
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(player))
    onDragStart(player)
  }

  // Extract first name and last initial
  const firstName = player.name.split(' ')[0]
  const lastNameInitial = player.name.split(' ')[1]?.[0] || ''

  return (
    <div
      className="absolute cursor-move z-20 select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Player Circle with Orange Background - Matches the drop zone size */}
        <div className="w-16 h-16 rounded-full bg-orange-500 border-2 border-orange-300 shadow-lg flex flex-col items-center justify-center">
          <span className="text-white font-bold text-xs text-center leading-tight">
            {firstName}
          </span>
          <span className="text-white font-bold text-xs">
            {lastNameInitial}.
          </span>
        </div>
        
        {/* Jersey Number Badge */}
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full border border-orange-500 mt-1">
          #{player.jerseyNumber}
        </div>
      </div>
    </div>
  )
}

export default function TeamManagement({ coachTeamId }: TeamManagementProps) {
  const [reservePlayers, setReservePlayers] = useState<Player[]>([])
  const [courtPlayers, setCourtPlayers] = useState<Map<string, Player>>(new Map())
  const [loading, setLoading] = useState(true)
  const [unassignedPlayers, setUnassignedPlayers] = useState<UnassignedPlayer[]>([])
  const [fetchingUnassigned, setFetchingUnassigned] = useState(false)


  const fetchLineup = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const authUserId = session?.user.id;
    if (!authUserId) {
      setLoading(false);
      return;
    }

    const lineupResponse = await getDefaultLineup(authUserId);

    if (lineupResponse.lineup) {
      const courtMap = new Map<string, Player>();
      const reserves: Player[] = [];

      lineupResponse.lineup.forEach((p) => {
        const player: Player = {
          teamID: p.team_id,
          playerID: p.player_id,
          name: p.player_name,
          position: p.position || "",
          isStarting: !!p.is_starting,
          jerseyNumber: p.jersey_number || 0,
          profileImage: `/playerPictures/${p.player_name.replace(/ /g, "")}.png`,
        };

        if (player.isStarting && player.position) {
          courtMap.set(player.position.toLowerCase(), player);
        } else {
          reserves.push(player);
        }
      });

      setCourtPlayers(courtMap);
      setReservePlayers(reserves);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLineup();
    fetchUnassignedPlayers(); // ⭐ NEW: also fetch unassigned players on mount
  }, [coachTeamId]);

  // Drag & Drop handlers ...
  const handleDrop = (e: React.DragEvent, positionId: string) => {
    e.preventDefault()
    const playerData = e.dataTransfer.getData("application/json")
    const droppedPlayer: Player = JSON.parse(playerData)

    const existingPlayer = courtPlayers.get(positionId)
    if (existingPlayer) setReservePlayers((prev) => [...prev, existingPlayer])

    setReservePlayers((prev) => prev.filter((p) => p.playerID !== droppedPlayer.playerID))
    setCourtPlayers((prev) => new Map(prev.set(positionId, droppedPlayer)))
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleCourtPlayerDragStart = (player: Player) => {
    const positionId = Array.from(courtPlayers.entries()).find(([_, p]) => p.playerID === player.playerID)?.[0]
    if (!positionId) return

    setCourtPlayers((prev) => {
      const newMap = new Map(prev)
      newMap.delete(positionId)
      return newMap
    })
    setReservePlayers((prev) => [...prev, player])
  }

  // Save lineup ...
  const handleSaveLineup = async () => {
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

    try {
      const response = await fetch("/api/lineups/UpdateDefault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lineupData),
      })

      const result = await response.json()
      if (response.ok) alert("Lineup successfully updated ✅")
      else {
        alert("Failed to update lineup ❌")
        console.log(result.error)
      }
    } catch (err: any) {
      alert("Error updating lineup ❌")
      console.log(err.message)
    }
  }

  // Fetch unassigned players
  const fetchUnassignedPlayers = async () => {
    setFetchingUnassigned(true)
    try {
      const res = await fetch("/api/coach/free")
      const data = await res.json()
      setUnassignedPlayers(data)
    } catch (err) {
      console.error("Error fetching unassigned players:", err)
    }
    setFetchingUnassigned(false)
  }

  // Assign player to team
  const assignPlayerToTeam = async (playerId: string) => {
    try {
      const res = await fetch("/api/coach/assign-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, teamId: coachTeamId }),
      })

      if (res.ok) {
        await fetchLineup();
        await fetchUnassignedPlayers();
      } else {
        const errData = await res.json()
        console.error("Error assigning player:", errData.error)
      }
    } catch (err) {
      console.error("Error assigning player:", err)
    }
  }




  if (loading) return <div>Loading lineup...</div>

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">Team Management</h1>
        
        <Button
          onClick={handleSaveLineup}
          disabled={courtPlayers.size < 5}
          className={`flex items-center gap-2 ${
            courtPlayers.size < 5 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
        >
          <Save className="w-4 h-4" />
          {courtPlayers.size < 5 ? `Need ${5 - courtPlayers.size} more players` : 'Save Lineup'}
        </Button>

        {/* Optional tooltip for disabled state */}
        {courtPlayers.size < 5 && (
          <div className="absolute right-0 top-full mt-2 bg-black text-white p-2 rounded text-sm">
            Assign {5 - courtPlayers.size} more players to save
          </div>
        )}
      </div>

      <div className="flex gap-6 h-[calc(130vh-160px)]">
        {/* Basketball Court */}
        <div className="flex-[7] relative">
        <Card className="h-full overflow-hidden bg-transparent backdrop-blur-sm">
          <CardContent className="p-0 pt-0 h-full relative">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat relative"
              style={{ backgroundImage: `url('/court/aerialView.png')` }}
            >
              <div className="absolute inset-0 bg-black/20"></div>

              {courtPositions.map((position) => (
                <React.Fragment key={position.id}>
                  {/* Invisible Drop Zone - keeps functionality but no visual circle */}
                  <div
                    className="absolute w-20 h-20 rounded-full z-10"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onDrop={(e) => handleDrop(e, position.id)}
                    onDragOver={handleDragOver}
                  />
                  
                  {/* Position Label */}
                  <div
                    className="absolute text-white font-bold text-sm bg-black/80 px-2 py-1 rounded z-30 pointer-events-none"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y + 12}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {position.label}
                  </div>
                </React.Fragment>
              ))}

              
                {/* Add this message when no starting lineup is set */}
                {courtPlayers.size === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="text-white/50 text-lg font-bold bg-black/30 p-4 rounded-lg">
                      No starting lineup set. Drag players from reserves to positions.
                    </div>
                  </div>
                )}
              {/* Render players on court using custom component */}
              {courtPositions.map((position) => {
                const player = courtPlayers.get(position.id)
                return player ? (
                  <CustomCourtPlayer
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

        {/* Reserves & Unassigned */}
        <div className="flex-[3] h-full flex flex-col gap-4">
          <Reserves players={reservePlayers} onAddPlayer={() => {}} />

          {/* Unassigned Players Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="group rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 bg-opacity-80 backdrop-blur-xl p-3 px-5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold">
                Show Unassigned Players
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 bg-opacity-80 backdrop-blur-xl shadow-2xl p-4">
              <DialogHeader>
                <DialogTitle className="text-white text-lg font-bold">Free Players</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <Button
                  onClick={fetchUnassignedPlayers}
                  disabled={fetchingUnassigned}
                  className="bg-black/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl hover:ring-2 hover:ring-pink-500"
                >
                  {fetchingUnassigned ? "Loading..." : "Refresh List"}
                </Button>

                {unassignedPlayers.length === 0 ? (
                  <p className="text-gray-200 text-center py-4">No unassigned players available.</p>
                ) : (
                  <ul className="space-y-2">
                    {unassignedPlayers.map((player) => (
                      <li
                        key={player.player_id}
                        className="flex justify-between items-center border border-white/20 p-2 rounded-xl bg-white/50 backdrop-blur-md"
                      >
                        <span className="text-white text-sm">
                          {player.first_name} {player.last_name} — {player.position} #{player.jersey_number}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => assignPlayerToTeam(player.player_id)}
                          className="bg-pink-500 text-white px-3 py-1 rounded-lg hover:bg-pink-600"
                        >
                          Add
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}