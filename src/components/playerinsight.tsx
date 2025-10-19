"use client"

import { useEffect, useState } from "react"
import { Award, TrendingUp, BarChart3 } from "lucide-react"
import { getPlayerPerformance } from "@/app/utils/apiClient"

interface PlayerStats {
  player_id: string
  player_name: string
  team_name: string
  points: number
  assists: number
  rebounds: number
  blocks: number
  steals: number
  fouls: number
}

export default function PlayerInsightsPanel() {
  const [playerData, setPlayerData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPlayerPerformance()
        setPlayerData(data)
      } catch (err: any) {
        console.error("Error fetching player performance:", err)
        setError("Failed to load player insights.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-center text-gray-500">Loading insights...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!playerData || playerData.length === 0)
    return <p className="text-gray-400 text-center mt-6">No data available.</p>

  const topScorers = [...playerData].sort((a, b) => b.points - a.points).slice(0, 5)
  const mostEfficient = [...playerData]
    .map((p) => ({
      ...p,
      efficiency: (p.assists + p.rebounds + p.steals + p.blocks) / (p.fouls + 1),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-black">Player Insights</h1>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-black">Top Scorers</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topScorers.map((p, idx) => (
            <div
              key={p.player_id}
              className="bg-white/10 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-orange-500/50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-black text-lg">
                  {idx + 1}. {p.player_name}
                </h3>
                <span className="text-orange-500 font-bold text-xl">{p.points} pts</span>
              </div>
              <p className="text-sm text-black/70">{p.team_name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-black">Most Efficient Players</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostEfficient.map((p) => (
            <div
              key={p.player_id}
              className="bg-white/10 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-orange-500/50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-black text-lg">{p.player_name}</h3>
                <span className="text-orange-500 font-bold text-xl">{p.efficiency.toFixed(2)}</span>
              </div>
              <p className="text-sm text-black/70">{p.team_name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-black">All Players Overview</h2>
        </div>
        <div className="bg-black/7 backdrop-blur-md border border-white/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left text-xs font-semibold text-black uppercase tracking-wider px-4 py-3">
                    Player
                  </th>
                  <th className="text-left text-xs font-semibold text-black uppercase tracking-wider px-4 py-3">
                    Team
                  </th>
                  <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                    PTS
                  </th>
                  <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                    AST
                  </th>
                  <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                    REB
                  </th>
                  <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                    STL
                  </th>
                  <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                    BLK
                  </th>
                  <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                    FLS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {playerData.map((p) => (
                  <tr key={p.player_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-black">{p.player_name}</td>
                    <td className="px-4 py-3 text-black/70">{p.team_name}</td>
                    <td className="px-2 py-3 text-center text-black font-semibold">{p.points}</td>
                    <td className="px-2 py-3 text-center text-black">{p.assists}</td>
                    <td className="px-2 py-3 text-center text-black">{p.rebounds}</td>
                    <td className="px-2 py-3 text-center text-black">{p.steals}</td>
                    <td className="px-2 py-3 text-center text-black">{p.blocks}</td>
                    <td className="px-2 py-3 text-center text-orange-500 font-semibold">{p.fouls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
