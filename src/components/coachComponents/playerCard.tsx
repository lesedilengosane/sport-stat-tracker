"use client"

import type React from "react"

import type { Player } from "@/types/player"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface PlayerCardProps {
  player: Player
 
  isDragging?: boolean
}

export function PlayerCard({ player,  isDragging = false }: PlayerCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(player))
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <Card
      className={`bg-white/60 border-gray-100 cursor-move transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "hover:bg-gray-400/30 border-gray-300 "
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

          <div className="flex-1 flex items-center justify-between gap-2">
            {/* Player Info */}
            <div className="min-w-0 flex-1">
              <h3 className="text-orange-400 font-medium text-sm truncate">{player.name}</h3>
              <p className="text-gray-400 text-xs">{player.position}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
