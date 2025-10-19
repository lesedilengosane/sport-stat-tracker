"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { use } from "react"
import { Award, TrendingUp, Target, Activity } from "lucide-react"

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
  image : string ;
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

  if (loading)
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-lg" />
        </div>
        <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-48 bg-orange-500/30 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    )

  if (error || !player)
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-lg" />
        </div>
        <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-md border border-white/50 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-black mb-2">Player not found</h1>
            {error && <p className="text-orange-500 font-medium">{error}</p>}
          </div>
        </div>
      </div>
    )

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <Image src="/background/ballBG.jpeg" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-lg" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/50 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center gap-8">
            {/* Player Image with Pulsing Effect - Main Focus */}
            <div className="relative flex items-center justify-center">
              {/* Pulsing circles behind the image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute w-64 h-64 rounded-full border-4 border-orange-500/30 animate-ping"
                  style={{ animationDuration: "3s" }}
                />
                <div
                  className="absolute w-72 h-72 rounded-full border-4 border-orange-500/20 animate-ping"
                  style={{ animationDuration: "4s", animationDelay: "0.5s" }}
                />
                <div
                  className="absolute w-80 h-80 rounded-full border-4 border-orange-500/10 animate-ping"
                  style={{ animationDuration: "5s", animationDelay: "1s" }}
                />
              </div>

              {/* Player Avatar */}
              <div className="relative z-10">
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-2 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white">
                 <Image
                  src = {player.image|| "/placeholder.svg?height=400&width=300"}
                  alt = {`${player.first_name} ${player.last_name}`}
                  fill
                  className="object-cover"
                 />
                  </div>
                </div>
                {/* Jersey Number Badge */}
                <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-3xl font-bold">#{player.jersey_number}</span>
                </div>
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center w-full">
              <h1 className="text-6xl font-extrabold text-black mb-3">
                {player.first_name} {player.last_name}
              </h1>
              <div className="flex items-center gap-4 justify-center mb-6">
                <span className="text-3xl font-semibold text-orange-500">{player.position}</span>
                <span className="text-2xl text-black/70">•</span>
                <span className="text-2xl text-black/70">{player.matches_played} Games Played</span>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 justify-center mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">{player.points}</div>
                  <div className="text-sm text-black/70 font-medium">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">{player.assists}</div>
                  <div className="text-sm text-black/70 font-medium">Assists</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">{player.rebounds}</div>
                  <div className="text-sm text-black/70 font-medium">Rebounds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Blocks", value: player.blocks, icon: <Award className="h-5 w-5 text-orange-500" /> },
            { label: "Steals", value: player.steals, icon: <TrendingUp className="h-5 w-5 text-orange-500" /> },
            { label: "Turnovers", value: player.turnovers, icon: <Activity className="h-5 w-5 text-orange-500" /> },
            { label: "Fouls", value: player.fouls, icon: <Target className="h-5 w-5 text-orange-500" /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-md border border-white/50 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all hover:border-orange-500/50"
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <p className="text-sm font-medium text-black/70 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/50 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-500" />
            Shooting Statistics
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/20">
              <p className="text-sm font-medium text-black/70 mb-2">2-Point Shots</p>
              <p className="text-3xl font-bold text-orange-500 mb-1">
                {player.twoPointsMade}/{player.twoPointsAttempted}
              </p>
              <p className="text-sm text-black/60">
                {player.twoPointsAttempted > 0
                  ? `${((player.twoPointsMade / player.twoPointsAttempted) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/20">
              <p className="text-sm font-medium text-black/70 mb-2">3-Point Shots</p>
              <p className="text-3xl font-bold text-orange-500 mb-1">
                {player.threePointsMade}/{player.threePointsAttempted}
              </p>
              <p className="text-sm text-black/60">
                {player.threePointsAttempted > 0
                  ? `${((player.threePointsMade / player.threePointsAttempted) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/20">
              <p className="text-sm font-medium text-black/70 mb-2">Free Throws</p>
              <p className="text-3xl font-bold text-orange-500 mb-1">
                {player.freeThrowsMade}/{player.freeThrowsAttempted}
              </p>
              <p className="text-sm text-black/60">
                {player.freeThrowsAttempted > 0
                  ? `${((player.freeThrowsMade / player.freeThrowsAttempted) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
