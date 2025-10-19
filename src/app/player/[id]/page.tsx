"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { use } from "react"
import { Award, TrendingUp, Target, Activity, Star, Trophy, Zap, Shield } from "lucide-react"

interface Player {
  player_id: string
  team_id: string
  first_name: string
  last_name: string
  position: string
  jersey_number: number
  turnovers: number
  fouls: number
  points: number
  assists: number
  rebounds: number
  blocks: number
  twoPointsMade: number
  twoPointsAttempted: number
  threePointsMade: number
  threePointsAttempted: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  matches_played: number
  steals: number
  image: string
}

interface PlayerDashboardProps {
  params: Promise<{ id: string }>
}

export default function PlayerDashboard({ params }: PlayerDashboardProps) {
  const { id } = use(params)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await fetch(`/api/players/${id}`)
        if (!res.ok) throw new Error("Failed to fetch player")
        const foundPlayer: Player = await res.json()

        if (!foundPlayer) {
          setError("Player not found")
        } else {
          setPlayer(foundPlayer)
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message)
        else setError("Failed to load player")
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [id])

  // Calculate advanced stats
  const calculateStats = (player: Player) => {
    const twoPointPercentage = player.twoPointsAttempted > 0 
      ? (player.twoPointsMade / player.twoPointsAttempted) * 100 
      : 0
    const threePointPercentage = player.threePointsAttempted > 0 
      ? (player.threePointsMade / player.threePointsAttempted) * 100 
      : 0
    const freeThrowPercentage = player.freeThrowsAttempted > 0 
      ? (player.freeThrowsMade / player.freeThrowsAttempted) * 100 
      : 0
    const pointsPerGame = player.matches_played > 0 
      ? (player.points / player.matches_played).toFixed(1) 
      : "0.0"

    return { twoPointPercentage, threePointPercentage, freeThrowPercentage, pointsPerGame }
  }

  if (loading)
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="fixed inset-0 z-0">
          <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover opacity-20" />
        </div>
        <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-48 bg-orange-500/30 rounded-lg animate-pulse mx-auto mb-4" />
            <div className="h-4 w-32 bg-orange-400/20 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    )

  if (error || !player)
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="fixed inset-0 z-0">
          <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover opacity-20" />
        </div>
        <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-200">
              <Trophy className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Player not found</h1>
            {error && <p className="text-orange-600 font-medium">{error}</p>}
          </div>
        </div>
      </div>
    )

  const { twoPointPercentage, threePointPercentage, freeThrowPercentage, pointsPerGame } = calculateStats(player)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Background with subtle pattern */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/background/ballBG.jpeg" 
          alt="Background" 
          fill 
          priority 
          className="object-cover opacity-[0.15]" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-amber-100/80" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Player Image with Enhanced Design */}
            <div className="relative flex-shrink-0">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full transform scale-110" />
                
                {/* Main avatar container */}
                <div className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-3 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-inner">
                    <Image
                      src={player.image || "/placeholder.svg?height=400&width=300"}
                      alt={`${player.first_name} ${player.last_name}`}
                      width={192}
                      height={192}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Jersey Number Badge */}
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-2xl border-4 border-white">
                  <span className="text-xl font-bold">#{player.jersey_number}</span>
                </div>
                
                {/* Position Badge */}
                <div className="absolute -top-2 -left-2 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-orange-200">
                  <span className="text-sm font-bold text-orange-600 uppercase tracking-wide">
                    {player.position}
                  </span>
                </div>
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {player.first_name} <span className="text-gray-900">{player.last_name}</span>
                </h1>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">{player.matches_played} Games</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">{pointsPerGame} PPG</span>
                  </div>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-3 gap-6 max-w-md">
                {[
                  { label: "Points", value: player.points, icon: <Target className="h-5 w-5" /> },
                  { label: "Assists", value: player.assists, icon: <TrendingUp className="h-5 w-5" /> },
                  { label: "Rebounds", value: player.rebounds, icon: <Award className="h-5 w-5" /> },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center group">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-orange-100 group-hover:border-orange-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Defense & Efficiency Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Defense Stats */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-orange-600" />
              Defense & Efficiency
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Blocks", value: player.blocks, color: "from-blue-500 to-cyan-500" },
                { label: "Steals", value: player.steals, color: "from-green-500 to-emerald-500" },
                { label: "Turnovers", value: player.turnovers, color: "from-red-500 to-rose-500" },
                { label: "Fouls", value: player.fouls, color: "from-purple-500 to-violet-500" },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="bg-gradient-to-br p-0.5 rounded-2xl shadow-lg">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shooting Efficiency */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Star className="h-6 w-6 text-orange-600" />
              Shooting Efficiency
            </h2>
            <div className="space-y-4">
              {[
                { 
                  label: "2-Point FG", 
                  made: player.twoPointsMade, 
                  attempted: player.twoPointsAttempted, 
                  percentage: twoPointPercentage,
                  color: "from-orange-500 to-amber-500"
                },
                { 
                  label: "3-Point FG", 
                  made: player.threePointsMade, 
                  attempted: player.threePointsAttempted, 
                  percentage: threePointPercentage,
                  color: "from-amber-500 to-yellow-500"
                },
                { 
                  label: "Free Throws", 
                  made: player.freeThrowsMade, 
                  attempted: player.freeThrowsAttempted, 
                  percentage: freeThrowPercentage,
                  color: "from-green-500 to-emerald-500"
                },
              ].map((stat) => (
                <div key={stat.label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{stat.label}</span>
                    <span className="text-sm font-bold text-gray-900">{stat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{stat.made}/{stat.attempted}</span>
                    <span>{stat.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Shooting Stats */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Target className="h-6 w-6 text-orange-600" />
            Shooting Breakdown
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                label: "2-Point Field Goals",
                made: player.twoPointsMade,
                attempted: player.twoPointsAttempted,
                percentage: twoPointPercentage,
                icon: <div className="w-3 h-3 bg-orange-500 rounded-full" />
              },
              {
                label: "3-Point Field Goals",
                made: player.threePointsMade,
                attempted: player.threePointsAttempted,
                percentage: threePointPercentage,
                icon: <div className="w-3 h-3 bg-amber-500 rounded-full" />
              },
              {
                label: "Free Throws",
                made: player.freeThrowsMade,
                attempted: player.freeThrowsAttempted,
                percentage: freeThrowPercentage,
                icon: <div className="w-3 h-3 bg-green-500 rounded-full" />
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border-2 border-orange-100 shadow-lg group-hover:shadow-xl group-hover:border-orange-200">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {stat.icon}
                    <h3 className="text-lg font-semibold text-gray-800">{stat.label}</h3>
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    {stat.made}<span className="text-2xl text-gray-600">/{stat.attempted}</span>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {stat.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
