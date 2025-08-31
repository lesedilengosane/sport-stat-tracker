"use client"

import type { Player, PlayerStats } from "@/types/basketball"

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
  const colorClasses = {
    blue: {
      border: "border-blue-300",
      selected: "bg-blue-100 border-blue-500 border-2",
      text: "text-blue-700",
    },
    red: {
      border: "border-red-300",
      selected: "bg-red-100 border-red-500 border-2",
      text: "text-red-700",
    },
  }

  const colors = colorClasses[teamColor]

  return (
    <div className="space-y-4">
      {team.players.map((player) => {
        const stats = getPlayerStats(player.id)
        const isSelected = selectedPlayer === player.id

        return (
          <div
            key={player.id}
            onClick={() => onPlayerSelect(player.id)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${isSelected ? colors.selected : `${colors.border} bg-white hover:bg-gray-50`}
            `}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${colors.text} mb-1`}>P{player.jerseyNumber}</div>
              <div className="text-sm text-gray-600 font-medium">{player.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.points} pts • {stats.assists} ast • {stats.rebounds} reb
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
