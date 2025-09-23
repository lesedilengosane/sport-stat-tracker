"use client"

import type React from "react"

import type { Player } from "@/types/player"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface PlayerCardProps {
  player: Player
  onStatusChange: (playerId: string, status: Player["status"]) => void
  isDragging?: boolean
}

export function PlayerCard({ player, onStatusChange, isDragging = false }: PlayerCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(player))
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <Card
      className={`bg-gray-800/80 border-gray-700 cursor-move transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "hover:bg-gray-700/80"
      }`}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Jersey Number */}
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {player.jerseyNumber}
          </div>

          {/* Player Image */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
            <Image
              src={player.profileImage || "/placeholder.svg"}
              alt={player.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex items-center justify-between gap-2">
            {/* Player Info */}
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium text-sm truncate">{player.name}</h3>
              <p className="text-gray-400 text-xs">{player.position}</p>
            </div>

            {/* Status Dropdown */}
            <div className="w-20">
              <Select
                value={player.status}
                onValueChange={(value: Player["status"]) => onStatusChange(player.id, value)}
              >
                <SelectTrigger className="w-full h-7 bg-gray-700 border-gray-600 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fit" className="text-green-400">
                    Fit
                  </SelectItem>
                  <SelectItem value="injured" className="text-red-400">
                    Injured
                  </SelectItem>
                  <SelectItem value="suspended" className="text-yellow-400">
                    Suspended
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
