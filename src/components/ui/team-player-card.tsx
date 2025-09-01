"use client"

import type { Player, PlayerStats } from "../../types/basketball"
import PlayerStatCard from "./player-stat-card"

interface TeamPlayerCardProps {
  team: {
    name: string
    color: string
    players: Player[]
  }
  selectedPlayer: string
  onPlayerSelect: (playerId: string) => void
  getPlayerStats: (playerId: string) => PlayerStats
  teamColor: "blue" | "red"
}

export default function TeamPlayerCard({
  team,
  selectedPlayer,
  onPlayerSelect,
  getPlayerStats,
  teamColor,
}: TeamPlayerCardProps) {
  return (
    <div className="space-y-4">
      {team.players.map((player) => {
        const stats = getPlayerStats(player.id)
        const isSelected = selectedPlayer === player.id

        return (
          <PlayerStatCard
            key={player.id}
            player={player}
            stats={stats}
            isSelected={isSelected}
            onSelect={onPlayerSelect}
            teamColor={teamColor}
          />
        )
      })}
    </div>
  )
}
