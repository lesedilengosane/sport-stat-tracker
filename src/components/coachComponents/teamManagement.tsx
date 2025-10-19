"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Save } from "lucide-react"
import { Reserves } from "@/components/coachComponents/reserves"
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

// Predefined court positions - memoized outside component
const COURT_POSITIONS: CourtPosition[] = [
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

// Custom Court Player Component with React.memo
const CustomCourtPlayer = React.memo(({ 
  player, 
  position, 
  onDragStart 
}: { 
  player: Player
  position: { x: number; y: number }
  onDragStart: (player: Player) => void
}) => {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(player))
    onDragStart(player)
  }, [player, onDragStart])

  // Memoize display name computation
  const displayName = useMemo(() => {
    const firstName = player.name.split(' ')[0]
    const lastNameInitial = player.name.split(' ')[1]?.[0] || ''
    return { firstName, lastNameInitial }
  }, [player.name])

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
        <div className="w-16 h-16 rounded-full bg-orange-500 border-2 border-orange-300 shadow-lg flex flex-col items-center justify-center">
          <span className="text-white font-bold text-xs text-center leading-tight">
            {displayName.firstName}
          </span>
          <span className="text-white font-bold text-xs">
            {displayName.lastNameInitial}.
          </span>
        </div>
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full border border-orange-500 mt-1">
          #{player.jerseyNumber}
        </div>
      </div>
    </div>
  )
})

CustomCourtPlayer.displayName = 'CustomCourtPlayer'

export default function TeamManagement({ coachTeamId }: TeamManagementProps) {
  // Combined state to reduce re-renders
  const [state, setState] = useState({
    reservePlayers: [] as Player[],
    courtPlayers: new Map<string, Player>(),
    unassignedPlayers: [] as UnassignedPlayer[],
    loading: true,
    saving: false,
    fetchingUnassigned: false,
    dialogOpen: false
  })

  const { reservePlayers, courtPlayers, unassignedPlayers, loading, saving, fetchingUnassigned, dialogOpen } = state

  // Helper to update state
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Optimized fetchLineup with useCallback
  const fetchLineup = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const authUserId = session?.user.id;
    if (!authUserId) {
      updateState({ loading: false });
      return;
    }

    try {
      const lineupResponse = await getDefaultLineup(authUserId);

      if (lineupResponse.lineup) {
        const courtMap = new Map<string, Player>();
        const reserves: Player[] = [];

        // Optimized loop
        for (const p of lineupResponse.lineup) {
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
        }

        updateState({ 
          courtPlayers: courtMap, 
          reservePlayers: reserves 
        });
      }
    } catch (error) {
      console.error("Error fetching lineup:", error);
    }
  }, [updateState]);

  // Fetch unassigned players with useCallback
  const fetchUnassignedPlayers = useCallback(async () => {
    updateState({ fetchingUnassigned: true });
    try {
      const res = await fetch("/api/coach/free");
      const data = await res.json();
      updateState({ unassignedPlayers: data });
    } catch (err) {
      console.error("Error fetching unassigned players:", err);
    } finally {
      updateState({ fetchingUnassigned: false });
    }
  }, [updateState]);

  // Load initial data in parallel
  useEffect(() => {
    const fetchInitialData = async () => {
      updateState({ loading: true });
      try {
        await Promise.all([
          fetchLineup(),
          fetchUnassignedPlayers()
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        updateState({ loading: false });
      }
    };
    
    fetchInitialData();
  }, [coachTeamId, fetchLineup, fetchUnassignedPlayers, updateState]);

  // Load unassigned players only when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchUnassignedPlayers();
    }
  }, [dialogOpen, fetchUnassignedPlayers]);

  // Optimized drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent, positionId: string) => {
    e.preventDefault();
    const playerData = e.dataTransfer.getData("application/json");
    const droppedPlayer: Player = JSON.parse(playerData);

    const existingPlayer = courtPlayers.get(positionId);
    
    // Batch state updates
    const newCourtPlayers = new Map(courtPlayers);
    const newReservePlayers = [...reservePlayers];

    if (existingPlayer) {
      newReservePlayers.push(existingPlayer);
    }

    newCourtPlayers.set(positionId, droppedPlayer);
    
    updateState({
      courtPlayers: newCourtPlayers,
      reservePlayers: newReservePlayers.filter(p => p.playerID !== droppedPlayer.playerID)
    });
  }, [courtPlayers, reservePlayers, updateState]);

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleCourtPlayerDragStart = useCallback((player: Player) => {
    const positionId = Array.from(courtPlayers.entries()).find(([_, p]) => p.playerID === player.playerID)?.[0];
    if (!positionId) return;

    const newCourtPlayers = new Map(courtPlayers);
    newCourtPlayers.delete(positionId);
    
    updateState({
      courtPlayers: newCourtPlayers,
      reservePlayers: [...reservePlayers, player]
    });
  }, [courtPlayers, reservePlayers, updateState]);

  // Optimized save lineup with optimistic updates
  const handleSaveLineup = useCallback(async () => {
    updateState({ saving: true });
    
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
    };

    try {
      const response = await fetch("/api/lineups/UpdateDefault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lineupData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Lineup successfully updated ✅");
      } else {
        alert("Failed to update lineup ❌");
        console.log(result.error);
      }
    } catch (err: any) {
      alert("Error updating lineup ❌");
      console.log(err.message);
    } finally {
      updateState({ saving: false });
    }
  }, [courtPlayers, reservePlayers, updateState]);

  // Assign player to team
  const assignPlayerToTeam = useCallback(async (playerId: string) => {
    try {
      const res = await fetch("/api/coach/assign-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, teamId: coachTeamId }),
      });

      if (res.ok) {
        // Refresh both lineups and unassigned players
        await Promise.all([
          fetchLineup(),
          fetchUnassignedPlayers()
        ]);
      } else {
        const errData = await res.json();
        console.error("Error assigning player:", errData.error);
      }
    } catch (err) {
      console.error("Error assigning player:", err);
    }
  }, [coachTeamId, fetchLineup, fetchUnassignedPlayers]);

  // Memoized court player render
  const renderedCourtPlayers = useMemo(() => {
    return COURT_POSITIONS.map((position) => {
      const player = courtPlayers.get(position.id);
      return player ? (
        <CustomCourtPlayer
          key={`${position.id}-${player.playerID}`}
          player={player}
          position={{ x: position.x, y: position.y }}
          onDragStart={handleCourtPlayerDragStart}
        />
      ) : null;
    });
  }, [courtPlayers, handleCourtPlayerDragStart]);

  if (loading) return <div>Loading lineup...</div>

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">Team Management</h1>
        
        <Button
          onClick={handleSaveLineup}
          disabled={courtPlayers.size < 5 || saving}
          className={`flex items-center gap-2 ${
            courtPlayers.size < 5 || saving
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : courtPlayers.size < 5 ? `Need ${5 - courtPlayers.size} more players` : 'Save Lineup'}
        </Button>
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

                {COURT_POSITIONS.map((position) => (
                  <React.Fragment key={position.id}>
                    {/* Visible Drop Zone with Circle */}
                    <div
                      className="absolute w-20 h-20 rounded-full z-10 border-2 border-dashed border-yellow-400/70 bg-yellow-400/20 transition-all duration-300 hover:border-solid hover:border-yellow-400 hover:bg-yellow-400/30 hover:scale-110 cursor-pointer"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onDrop={(e) => handleDrop(e, position.id)}
                      onDragOver={handleDragOver}
                      title={`Drop player to ${position.label}`}
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

                {/* Empty state message */}
                {courtPlayers.size === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="text-white/50 text-lg font-bold bg-black/30 p-4 rounded-lg">
                      No starting lineup set. Drag players from reserves to positions.
                    </div>
                  </div>
                )}

                {/* Render players on court */}
                {renderedCourtPlayers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reserves & Unassigned */}
        <div className="flex-[3] h-full flex flex-col gap-4">
          <Reserves players={reservePlayers} onAddPlayer={() => {}} />

          {/* Unassigned Players Dialog */}
          <Dialog open={dialogOpen} onOpenChange={(open) => updateState({ dialogOpen: open })}>
            <DialogTrigger asChild>
              <Button 
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-none"
                onClick={() => updateState({ dialogOpen: true })}
              >
                Add free Players
              </Button>
            </DialogTrigger>

            <DialogContent 
              className="max-w-md rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 bg-opacity-80 backdrop-blur-xl shadow-2xl p-4"
              onInteractOutside={() => updateState({ dialogOpen: false })}
            >
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
                  <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {unassignedPlayers.map((player) => (
                      <li
                        key={player.player_id}
                        className="flex justify-between items-center border border-white/20 p-2 rounded-xl bg-white/50 backdrop-blur-md list-none"
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
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}