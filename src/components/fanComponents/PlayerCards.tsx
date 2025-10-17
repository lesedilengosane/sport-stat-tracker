"use client"
import Image from "next/image"
import { useEffect, useState } from "react"

interface Player {
  id: string
  first_name: string
  last_name: string
  position: string
  avatar_url: string
  jersey_number: number
  team_id: string
}

export default function PlayerCards() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch("/api/players")
        if (!res.ok) throw new Error("Failed to fetch players")
        const data: Player[] = await res.json()
        setPlayers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  if (loading) return <p className="text-center text-black">Loading players...</p>

  return (
    <div>
      <h2 className="text-3xl font-bold text-black mb-6">Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="group relative bg-black/10 border border-white/70 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg"
          >
            {/* Player Image - 70% of card */}
            <div className="relative aspect-[3/4]">
              <Image
                src={player.avatar_url || "/placeholder.svg?height=400&width=300"}
                alt={`${player.first_name} ${player.last_name}`}
                fill
                className="object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
            </div>

            {/* Player Info Footer - 30% of card */}
            <div className="p-3 bg-black/10">
              <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">
                {player.first_name} {player.last_name}
              </h3>
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <div className="text-black font-medium">POS</div>
                  <div className="text-white/80 font-semibold">{player.position}</div>
                </div>
                <div className="text-center">
                  <div className="text-black font-medium">NO.</div>
                  <div className="text-white/80 font-semibold">#{player.jersey_number}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
