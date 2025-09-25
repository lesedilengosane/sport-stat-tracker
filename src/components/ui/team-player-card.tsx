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
        const stats = getPlayerStats(player.player_id)
        const isSelected = selectedPlayer === player.player_id

        return (
          <PlayerStatCard
            key={player.player_id}
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
