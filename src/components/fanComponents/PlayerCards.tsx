"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ExternalLink, Shirt } from 'lucide-react'

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
  const router = useRouter()

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading players...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
          Team Players
        </h2>
        <p className="text-gray-600">Meet our talented roster of athletes</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {players.map((player) => (
          <div
            key={player.id}
            className="group relative bg-white rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl border-2 border-orange-200"
            onClick={() => router.push(`/player/${player.id}`)}
          >
            {/* Player Image with Gradient Overlay */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={player.avatar_url || "/placeholder.svg?height=300&width=225"}
                alt={`${player.first_name} ${player.last_name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Jersey Number Badge */}
              <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                #{player.jersey_number}
              </div>

              {/* Hover Effect Indicator */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Player Info */}
            <div className="p-3 bg-gradient-to-b from-white to-orange-50">
              {/* Name */}
              <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1 text-center group-hover:text-orange-600 transition-colors">
                {player.first_name} {player.last_name}
              </h3>

              {/* Position and Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Shirt className="h-3 w-3 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-700 bg-orange-100 px-2 py-1 rounded-full">
                    {player.position}
                  </span>
                </div>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/player/${player.id}`)
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1 h-6"
                >
                  View
                </Button>
              </div>
            </div>

            {/* Orange Accent Border Bottom */}
            <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {players.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shirt className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Found</h3>
          <p className="text-gray-600">There are currently no players in the system.</p>
        </div>
      )}
    </div>
  )
}