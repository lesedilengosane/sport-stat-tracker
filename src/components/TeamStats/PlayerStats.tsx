"use client"

import type React from "react"
import { useState } from "react"
import { Trophy, Target, UsersIcon, Shield, Zap, Crosshair, ChevronDown, ChevronUp } from "lucide-react"

interface PlayerStat {
  apg: number
  ppg: number
  rpg: number
  fouls: number
  blocks: number
  points: number
  steals: number
  assists: number
  position: string
  rebounds: number
  last_name: string
  player_id: string
  turnovers: number
  first_name: string
  fg_percentage: number
  jersey_number: number
  twoPointsMade: number
  freeThrowsMade: number
  matches_played: number
  threePointsMade: number
  twoPointsAttempted: number
  freeThrowsAttempted: number
  three_pt_percentage: number
  threePointsAttempted: number
}

interface PlayerStatsProps {
  playerStats: PlayerStat[]
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ playerStats }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStat | null>(null)

  if (!playerStats || playerStats.length === 0) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 shadow-lg p-8 mt-6">
        <div className="text-center py-8">
          <p className="text-black/50 italic text-lg">No player statistics available</p>
        </div>
      </div>
    )
  }

  // Calculate player efficiency rating (simplified PER)
  const calculateEfficiency = (player: PlayerStat): number => {
    const positiveStats = player.points + player.rebounds + player.assists + player.steals + player.blocks
    const negativeStats = player.turnovers + player.fouls * 0.5
    const efficiency = positiveStats - negativeStats
    return Math.round(efficiency * 100) / 100
  }

  // Add efficiency to each player
  const playersWithEfficiency = playerStats.map((player) => ({
    ...player,
    efficiency: calculateEfficiency(player),
  }))

  // Sort players by different categories
  const topScorers = [...playersWithEfficiency].sort((a, b) => b.ppg - a.ppg)
  const topRebounders = [...playersWithEfficiency].sort((a, b) => b.rpg - a.rpg)
  const topPlaymakers = [...playersWithEfficiency].sort((a, b) => b.apg - a.apg)
  const topDefenders = [...playersWithEfficiency].sort((a, b) => b.steals + b.blocks - (a.steals + a.blocks))
  const mostEfficient = [...playersWithEfficiency].sort((a, b) => b.efficiency - a.efficiency)
  const bestShooters = [...playersWithEfficiency].sort((a, b) => b.fg_percentage - a.fg_percentage)

  // Get team MVP (highest efficiency)
  const teamMVP = mostEfficient[0]

  // Stats categories for ranking tables
  const statCategories = [
    { key: "scoring", title: "Top Scorers", icon: Trophy, data: topScorers, stat: "ppg", suffix: " PPG" },
    { key: "rebounding", title: "Top Rebounders", icon: Target, data: topRebounders, stat: "rpg", suffix: " RPG" },
    { key: "playmaking", title: "Top Playmakers", icon: UsersIcon, data: topPlaymakers, stat: "apg", suffix: " APG" },
    { key: "defense", title: "Top Defenders", icon: Shield, data: topDefenders, stat: "defense", suffix: " DEF" },
    { key: "efficiency", title: "Most Efficient", icon: Zap, data: mostEfficient, stat: "efficiency", suffix: " EFF" },
    {
      key: "shooting",
      title: "Best Shooters",
      icon: Crosshair,
      data: bestShooters,
      stat: "fg_percentage",
      suffix: "% FG",
    },
  ]

  const renderPlayerCard = (player: PlayerStat, rank: number) => {
    const isSelected = selectedPlayer?.player_id === player.player_id

    return (
      <div
        key={player.player_id}
        className={`bg-white/60 backdrop-blur-sm rounded-xl border-l-4 p-5 cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? "shadow-lg border-orange-500" : "border-orange-500/40"
        }`}
        style={{ borderLeftColor: getRankColor(rank) }}
        onClick={() => setSelectedPlayer(isSelected ? null : player)}
      >
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: getRankColor(rank) }}
          >
            #{rank}
          </div>
          <div className="flex-1">
            <div className="font-bold text-black text-lg">
              {player.first_name} {player.last_name}
            </div>
            <div className="text-sm text-black/60">
              #{player.jersey_number} • {player.position}
            </div>
          </div>
        </div>

        {isSelected && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <span className="block text-xs text-black/60 mb-1">Points</span>
                <span className="block font-bold text-black">{player.points}</span>
              </div>
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <span className="block text-xs text-black/60 mb-1">Rebounds</span>
                <span className="block font-bold text-black">{player.rebounds}</span>
              </div>
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <span className="block text-xs text-black/60 mb-1">Assists</span>
                <span className="block font-bold text-black">{player.assists}</span>
              </div>
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <span className="block text-xs text-black/60 mb-1">Steals</span>
                <span className="block font-bold text-black">{player.steals}</span>
              </div>
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <span className="block text-xs text-black/60 mb-1">Blocks</span>
                <span className="block font-bold text-black">{player.blocks}</span>
              </div>
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <span className="block text-xs text-black/60 mb-1">FG%</span>
                <span className="block font-bold text-black">{player.fg_percentage}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderRankingTable = (category: (typeof statCategories)[0]) => {
    const showAll = expandedCategory === category.key
    const displayData = showAll ? category.data : category.data.slice(0, 3)
    const Icon = category.icon

    return (
      <div
        key={category.key}
        className="bg-white/60 backdrop-blur-sm rounded-xl border border-orange-500/20 overflow-hidden"
      >
        <div
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/40 transition-colors border-b border-black/5"
          onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-black">{category.title}</h3>
          </div>
          {showAll ? (
            <ChevronUp className="h-5 w-5 text-orange-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-orange-500" />
          )}
        </div>

        <div className="p-3">
          {displayData.map((player, index) => (
            <div
              key={player.player_id}
              className="flex items-center p-3 hover:bg-white/40 rounded-lg transition-colors"
            >
              <div className="w-14">
                <span
                  className="font-bold"
                  style={{
                    color: getRankColor(index + 1),
                    fontSize: index < 3 ? "1.1rem" : "1rem",
                  }}
                >
                  #{index + 1}
                </span>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-black block">
                  {player.first_name} {player.last_name}
                </span>
                <span className="text-sm text-black/60">
                  #{player.jersey_number} • {player.position}
                </span>
              </div>
            </div>
          ))}
        </div>

        {category.data.length > 3 && (
          <div
            className="text-center p-4 text-orange-500 font-semibold cursor-pointer hover:bg-white/40 transition-colors border-t border-black/5"
            onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
          >
            {showAll ? "Show Less" : `See All ${category.data.length} Players`}
          </div>
        )}
      </div>
    )
  }

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return "#FFD700" // Gold
      case 2:
        return "#C0C0C0" // Silver
      case 3:
        return "#CD7F32" // Bronze
      default:
        return "#ff6b35" // Orange
    }
  }

  const getRankStyle = (rank: number): React.CSSProperties => ({
    fontWeight: "bold",
    color: getRankColor(rank),
    fontSize: rank <= 3 ? "1.1rem" : "1rem",
  })

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-black/10 shadow-lg p-8 mt-6">
      {/* Team MVP Spotlight */}
      {teamMVP && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <span className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-2">
              Team MVP
            </span>
            <h2 className="text-2xl font-bold text-black">Player Spotlight</h2>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {teamMVP.first_name} {teamMVP.last_name}
                </div>
                <div className="text-black/60 mb-6">
                  #{teamMVP.jersey_number} • {teamMVP.position} • {teamMVP.matches_played} Games
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                    <span className="block text-2xl font-bold text-black">{teamMVP.ppg}</span>
                    <span className="block text-xs text-black/60 uppercase tracking-wide">Points/G</span>
                  </div>
                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                    <span className="block text-2xl font-bold text-black">{teamMVP.rpg}</span>
                    <span className="block text-xs text-black/60 uppercase tracking-wide">Rebounds/G</span>
                  </div>
                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                    <span className="block text-2xl font-bold text-black">{teamMVP.apg}</span>
                    <span className="block text-xs text-black/60 uppercase tracking-wide">Assists/G</span>
                  </div>
                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                    <span className="block text-2xl font-bold text-black">{teamMVP.efficiency}</span>
                    <span className="block text-xs text-black/60 uppercase tracking-wide">Efficiency</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-orange-500 flex flex-col items-center justify-center bg-gradient-to-br from-white to-orange-50">
                  <span className="text-3xl font-bold text-orange-500">{teamMVP.efficiency}</span>
                  <span className="text-xs text-black/60 uppercase tracking-wide">EFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Players Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-black mb-6 text-center flex items-center justify-center gap-2">
          <Target className="h-6 w-6 text-orange-500" />
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mostEfficient.slice(0, 4).map((player, index) => renderPlayerCard(player, index + 1))}
        </div>
      </div>

      {/* Statistical Rankings */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-black mb-6 text-center flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-orange-500" />
          Statistical Rankings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {statCategories.map((category) => renderRankingTable(category))}
        </div>
      </div>

      {/* Team Summary */}
      <div className="flex justify-around bg-white/60 backdrop-blur-sm rounded-xl border border-orange-500/20 p-6">
        <div className="text-center">
          <span className="block text-3xl font-bold text-orange-500">{playersWithEfficiency.length}</span>
          <span className="block text-sm text-black/60 uppercase tracking-wide">Total Players</span>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-bold text-orange-500">
            {Math.round(playersWithEfficiency.reduce((sum, p) => sum + p.ppg, 0) / playersWithEfficiency.length)}
          </span>
          <span className="block text-sm text-black/60 uppercase tracking-wide">Avg PPG</span>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-bold text-orange-500">
            {playersWithEfficiency.reduce((sum, p) => sum + p.points, 0)}
          </span>
          <span className="block text-sm text-black/60 uppercase tracking-wide">Total Points</span>
        </div>
      </div>
    </div>
  )
}

export default PlayerStats
