"use client"

interface Player {
  player_id: string
  name: string
  team: string
  ppg: number
  rpg: number
  apg: number
  fg: number
}

interface TopScorersProps {
  players?: Player[]
}

export function TopScorers({ players }: TopScorersProps) {
  // Use the provided players data or empty array if none provided
  const displayPlayers = players || []

  // If no players provided, show nothing or a message
  if (displayPlayers.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Top Scorers</h2>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden p-6">
          <p className="text-white text-center">No player data available</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Top Scorers</h2>
      <div className="bg-black/7 backdrop-blur-md border border-white/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-xs font-semibold text-black uppercase tracking-wider px-4 py-3">
                  Player
                </th>
                <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                  PPG
                </th>
                <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                  RPG
                </th>
                <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                  APG
                </th>
                <th className="text-center text-xs font-semibold text-black uppercase tracking-wider px-2 py-3">
                  FG%
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {displayPlayers.map((player) => (
                <tr key={player.player_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">{player.name}</div>
                    <div className="text-gray-400 text-xs">{player.team}</div>
                  </td>
                  <td className="text-center text-white font-semibold px-2 py-3">{player.ppg.toFixed(1)}</td>
                  <td className="text-center text-white px-2 py-3">{player.rpg.toFixed(1)}</td>
                  <td className="text-center text-white px-2 py-3">{player.apg.toFixed(1)}</td>
                  <td className="text-center text-white px-2 py-3">{player.fg.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}