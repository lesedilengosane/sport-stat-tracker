"use client"

import type { Player } from "@/types/player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { PlayerCard } from "@/components/coachComponents/playerCard"

interface ReservesProps {
  players: Player[]
  onAddPlayer: () => void
}

export function Reserves({ players, onAddPlayer}: ReservesProps) {
  return (
    <Card className="h-full flex flex-col bg-white/50 backdrop-blur-sm border-orange-500/20">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-semibold text-orange-400">Reserves</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        {/* Scrollable player cards area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-transparent pr-2 min-h-0">
          <div className="space-y-3">
            {players.length > 0 ? (
              players.map((player) => <PlayerCard key={player.playerID} player={player} />)
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-gray-300">
                  <p className="text-lg">Players should appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed footer with Add Player button */}
        <div className="flex-shrink-0 border-t border-orange-500/20 pt-4 mt-4">
          <Button
            onClick={onAddPlayer}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-none"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
