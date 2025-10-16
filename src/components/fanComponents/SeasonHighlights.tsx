"use client"
import type React from "react"
import { Award, Target, TrendingUp, BarChart3 } from "lucide-react"

interface HighlightCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
}

function HighlightCard({ title, value, change, icon }: HighlightCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      {change && <div className="text-green-400 text-sm">{change}</div>}
    </div>
  )
}

interface SeasonHighlightsProps {
  highlights: {
    ppg_leader: { name: string; ppg: number }
    apg_leader: { name: string; apg: number }
    rpg_leader: { name: string; rpg: number }
    fg_leader: { name: string; fg_pct: number }
  }
}

export function SeasonHighlights({ highlights }: SeasonHighlightsProps) {
  const cards: HighlightCardProps[] = [
    {
      title: `League PPG Leader: ${highlights.ppg_leader.name}`,
      value: highlights.ppg_leader.ppg.toFixed(1),
      icon: <Award className="h-5 w-5 text-orange-500" />,
    },
    {
      title: `Top Assists Leader: ${highlights.apg_leader.name}`,
      value: highlights.apg_leader.apg.toFixed(1),
      icon: <Target className="h-5 w-5 text-orange-500" />,
    },
    {
      title: `Rebounds Leader: ${highlights.rpg_leader.name}`,
      value: highlights.rpg_leader.rpg.toFixed(1),
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
    },
    {
      title: `Highest FG%: ${highlights.fg_leader.name}`,
      value: `${highlights.fg_leader.fg_pct.toFixed(1)}%`,
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
    },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Season Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((highlight, index) => (
          <HighlightCard key={index} {...highlight} />
        ))}
      </div>
    </div>
  )
}
