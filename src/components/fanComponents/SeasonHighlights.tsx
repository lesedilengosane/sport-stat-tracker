"use client"
import type React from "react"
import { Award, Target, TrendingUp, BarChart3 } from "lucide-react"

interface HighlightCardProps {
  title: string
  value: string | number
  change: string
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
      <div className="text-green-400 text-sm">{change}</div>
    </div>
  )
}

export function SeasonHighlights() {
  // These stats should be calculated from the players table
  // Using points, assists, rebounds, and shooting percentages
  const highlights = [
    {
      title: "League PPG Leader",
      value: "33.7",
      change: "+2.3",
      icon: <Award className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Top Assists Leader",
      value: "9.2",
      change: "+1.1 APG",
      icon: <Target className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Rebounds Leader",
      value: "11.2",
      change: "+0.8 RPG",
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Highest FG%",
      value: "56.8%",
      change: "+4.1%",
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
    },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Season Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((highlight, index) => (
          <HighlightCard key={index} {...highlight} />
        ))}
      </div>
    </div>
  )
}
