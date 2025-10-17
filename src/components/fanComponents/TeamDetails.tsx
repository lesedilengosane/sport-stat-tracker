"use client"

import { useEffect, useState } from "react"
import type { PlayersStats } from "@/types/player"
import Link from "next/link"
import type { TeamDetailsProps, TeamInfo, TeamMatch } from "@/types/team"

export default function TeamDetails({ teamId }: TeamDetailsProps) {
  const [players, setPlayers] = useState<PlayersStats[]>([])
  const [matches, setMatches] = useState<TeamMatch[]>([])
  const [team, setTeam] = useState<TeamInfo>({
    name: "Loading...",
    coach: "Loading...",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"roster" | "schedule" | "stats">("roster")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPlayers = await fetch("/api/pl")
        if (!resPlayers.ok) throw new Error("Failed to fetch players")
        const playersData: PlayersStats[] = await resPlayers.json()

        const teamPlayers = playersData.filter((p) => p.team_id === teamId)


        const resTeam = await fetch("/api/all")
        if (!resTeam.ok) throw new Error("Failed to fetch team data")
        const { coaches, matches } = await resTeam.json()

        const teamCoach = coaches.find((c: any) => c.teams?.team_id === teamId)

        const teamInfo: TeamInfo = {
          name: teamCoach?.teams?.team_name || "Unknown Team",
          coach: teamCoach ? `${teamCoach.users.first_name} ${teamCoach.users.last_name}` : "No Coach",
          icon_url: teamCoach?.teams?.icon_url || null,
        }



        const teamMatches = matches.filter(
          (m: TeamMatch) => m.home_team?.team_id === teamId || m.away_team?.team_id === teamId,
        )

        setPlayers(teamPlayers)
        setTeam(teamInfo)
        setMatches(teamMatches)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (teamId) fetchData()
  }, [teamId])

  if (loading) return <p className="text-center mt-10 text-gray-900">Loading...</p>
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>
  if (players.length === 0) return <p className="text-center mt-10 text-gray-900">No players found for this team.</p>

  const totalPoints = players.reduce((sum, p) => sum + p.points, 0)
  const totalAssists = players.reduce((sum, p) => sum + p.assists, 0)
  const totalRebounds = players.reduce((sum, p) => sum + p.rebounds, 0)
  const totalBlocks = players.reduce((sum, p) => sum + p.blocks, 0)
  const totalSteals = players.reduce((sum, p) => sum + p.steals, 0)

  const wins = matches.filter(
    (m) =>
      (m.home_team.team_name === team.name && (m.home_score ?? 0) > (m.away_score ?? 0)) ||
      (m.away_team.team_name === team.name && (m.away_score ?? 0) > (m.home_score ?? 0)),
  ).length

  const losses = matches.filter(
    (m) =>
      (m.home_team.team_name === team.name && (m.home_score ?? 0) < (m.away_score ?? 0)) ||
      (m.away_team.team_name === team.name && (m.away_score ?? 0) < (m.home_score ?? 0)),
  ).length

  return (
    <div className="min-h-screen bg-white border-2 border-orange-500 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-orange-50 border-b-2 border-orange-200 px-6 py-8">
        <div className="flex items-center gap-6">
          {team.icon_url && (
            <img
              src={team.icon_url || "/placeholder.svg"}
              alt={team.name}
              className="w-24 h-24 object-contain bg-white rounded-lg p-2 border-2 border-orange-300"
            />
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏀</span>
              <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">{team.name}</h1>
            </div>
            <p className="text-lg text-gray-700">Coach: {team.coach}</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-orange-50 border-b-2 border-orange-200 px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { label: "Games Played", value: matches.length },
            { label: "Record", value: `${wins}-${losses}` },
            { label: "Total Points", value: totalPoints },
            { label: "Total Assists", value: totalAssists },
            { label: "Total Rebounds", value: totalRebounds },
            { label: "Blocks + Steals", value: totalBlocks + totalSteals },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stat.value}</div>
              <div className="text-sm text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-orange-200 sticky top-0 z-10">
        <div className="flex gap-8 px-4">
          {["roster", "schedule", "stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8">
        {activeTab === "roster" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Roster</h2>
            <div className="bg-white rounded-xl border-2 border-orange-300 overflow-hidden shadow-lg">
              <table className="min-w-full divide-y divide-orange-200">
                <thead className="bg-orange-50">
                  <tr>
                    {["#", "Player", "Position", "PTS", "AST", "REB", "BLK", "STL"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100">
                  {players.map((p) => (
                    <tr key={p.player_id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{p.jersey_number}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/players/${p.player_id}`}
                          className="text-orange-600 hover:text-orange-700 font-semibold"
                        >
                          {p.first_name} {p.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.points}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.assists}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.rebounds}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.blocks}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.steals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Schedule</h2>
            <div className="space-y-4">
              {matches.map((m) => {
                const isHome = m.home_team.team_name === team.name
                const opponent = isHome ? m.away_team : m.home_team
                const teamScore = isHome ? m.home_score : m.away_score
                const opponentScore = isHome ? m.away_score : m.home_score
                const win = (teamScore ?? 0) > (opponentScore ?? 0)

                return (
                  <div
                    key={m.match_id}
                    className="bg-white rounded-xl border-2 border-orange-300 p-6 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-sm text-gray-600">
                          {new Date(m.match_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">{team.name}</span>
                          <span className="text-gray-500">vs</span>
                          <span className="text-sm font-semibold text-gray-900">{opponent.team_name}</span>
                        </div>
                      </div>
                      {m.completed && (
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {teamScore} - {opponentScore}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              win ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {win ? "W" : "L"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Offensive Stats",
                  stats: [
                    { label: "Total Points", value: totalPoints },
                    { label: "Total Assists", value: totalAssists },
                    { label: "PPG", value: matches.length ? (totalPoints / matches.length).toFixed(1) : "0.0" },
                    { label: "APG", value: matches.length ? (totalAssists / matches.length).toFixed(1) : "0.0" },
                  ],
                },
                {
                  title: "Defensive Stats",
                  stats: [
                    { label: "Total Rebounds", value: totalRebounds },
                    { label: "Total Blocks", value: totalBlocks },
                    { label: "Total Steals", value: totalSteals },
                    { label: "RPG", value: matches.length ? (totalRebounds / matches.length).toFixed(1) : "0.0" },
                  ],
                },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-xl border-2 border-orange-300 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{card.title}</h3>
                  <div className="space-y-3">
                    {card.stats.map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-gray-700">{s.label}</span>
                        <span className="text-xl font-bold text-orange-600">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
