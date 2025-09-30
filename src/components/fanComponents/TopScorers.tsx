"use client"

interface Player {
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
  // Default sample data - should be replaced with data from players table
  // Query: SELECT first_name, last_name, points/matches_played as ppg,
  //        rebounds/matches_played as rpg, assists/matches_played as apg,
  //        (twoPointsMade + threePointsMade) / (twoPointsAttempted + threePointsAttempted) * 100 as fg%
  const defaultPlayers: Player[] = [
    { name: "LeBron James", team: "Los Angeles Lakers", ppg: 27.8, rpg: 7.5, apg: 8.1, fg: 52.3 },
    { name: "Stephen Curry", team: "Golden State Warriors", ppg: 29.4, rpg: 5.2, apg: 6.3, fg: 48.7 },
    { name: "Kevin Durant", team: "Phoenix Suns", ppg: 30.1, rpg: 6.8, apg: 5.2, fg: 53.1 },
    { name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", ppg: 31.5, rpg: 11.2, apg: 5.5, fg: 56.8 },
    { name: "Luka Dončić", team: "Dallas Mavericks", ppg: 33.7, rpg: 8.9, apg: 9.2, fg: 49.4 },
  ]

  const displayPlayers = players || defaultPlayers

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Top Scorers</h2>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">
                  Player
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-3">
                  PPG
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-3">
                  RPG
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-3">
                  APG
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-3">
                  FG%
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {displayPlayers.map((player, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">{player.name}</div>
                    <div className="text-gray-400 text-xs">{player.team}</div>
                  </td>
                  <td className="text-center text-white font-semibold px-2 py-3">{player.ppg}</td>
                  <td className="text-center text-white px-2 py-3">{player.rpg}</td>
                  <td className="text-center text-white px-2 py-3">{player.apg}</td>
                  <td className="text-center text-white px-2 py-3">{player.fg}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
