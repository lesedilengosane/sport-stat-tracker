"use client"

import type React from "react"

import type { Player } from "@/types/player"
import Image from "next/image"

interface CourtPlayerProps {
  player: Player
  position: { x: number; y: number }
  onDragStart: (player: Player) => void
}

export function CourtPlayer({ player, position, onDragStart }: CourtPlayerProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(player))
    e.dataTransfer.effectAllowed = "move"
    onDragStart(player)
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move z-20"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-2 border-orange-500 hover:scale-105 transition-transform">
        <Image
          src={player.profileImage || "/placeholder.svg"}
          alt={player.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
