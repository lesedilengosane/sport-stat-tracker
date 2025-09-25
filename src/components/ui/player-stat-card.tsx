"use client"

import type { Player, PlayerStats } from "@/types/basketball"

interface PlayerStatCardProps {
  player: Player
  stats: PlayerStats
  isSelected: boolean
  onSelect: (playerId: string) => void
  teamColor: "blue" | "red"
}

export default function PlayerStatCard({ player, stats, isSelected, onSelect, teamColor }: PlayerStatCardProps) {
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
    <div
      onClick={() => onSelect(player.player_id)}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isSelected ? colors.selected : `${colors.border} bg-white hover:bg-gray-50`}
      `}
    >
      <div className="text-center">
        <div className={`text-2xl font-bold ${colors.text} mb-1`}>{player.position}</div>
        <div className="text-sm text-gray-600 font-medium">{player.name}</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.points} pts • {stats.assists} ast • {stats.rebounds} reb
        </div>
      </div>
    </div>
  )
}
