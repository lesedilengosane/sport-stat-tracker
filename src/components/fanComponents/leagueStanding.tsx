"use client"

interface TeamStanding {
  team_id: string
  team: string
  wins: number
  losses: number
  pct: number | null
}

interface LeagueStandingsProps {
  standings?: TeamStanding[]
  compact?: boolean
}

export function LeagueStandings({ standings, compact = false }: LeagueStandingsProps) {
  // Use the provided standings data or empty array if none provided
  const displayStandings = standings || []

  // Transform the data to match the component's expected format and calculate missing fields
  const transformedStandings = displayStandings
    .map((team, index) => {
      // Calculate rank based on wins (descending) and losses (ascending)
      const sortedByWins = [...displayStandings].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins
        return a.losses - b.losses
      })
      const rank = sortedByWins.findIndex((t) => t.team_id === team.team_id) + 1

      // Generate abbreviation from team name (first 3 characters)
      const abbr = team.team.substring(0, 3).toUpperCase()

      // Calculate PCT if null, otherwise use provided value
      const pct = team.pct !== null ? team.pct : team.wins + team.losses > 0 ? team.wins / (team.wins + team.losses) : 0

      // Calculate Games Behind (GB) - simplified version
      const maxWins = Math.max(...displayStandings.map((t) => t.wins))
      const gb =
        maxWins > 0 ? (maxWins - team.wins + (team.losses - Math.min(...displayStandings.map((t) => t.losses)))) / 2 : 0
      const gbDisplay = gb === 0 ? "-" : gb.toFixed(1)

      // Default values for L10 and STRK since they're not in the JSON
      const l10 = "0-0"
      const strk = "-"

      return {
        rank,
        team: team.team,
        abbr,
        wins: team.wins,
        losses: team.losses,
        pct,
        gb: gbDisplay,
        l10,
        strk,
        team_id: team.team_id,
      }
    })
    // Sort by rank
    .sort((a, b) => a.rank - b.rank)

  // If no standings provided, show nothing or a message
  if (transformedStandings.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-${compact ? "2xl" : "3xl"} font-bold text-black`}>League Standings</h2>
        </div>
        <div className="bg-white border-2 border-orange-500 rounded-xl overflow-hidden p-6 shadow-lg">
          <p className="text-gray-600 text-center">No standings data available</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-${compact ? "2xl" : "3xl"} font-bold text-white`}>League Standings</h2>
      </div>
      <div className="bg-black/10 border border-white/70  rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50 border-b-2 border-orange-200">
              <tr>
                <th
                  className={`text-left text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "4" : "6"} py-${compact ? "3" : "4"}`}
                >
                  Rank
                </th>
                <th
                  className={`text-left text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "4" : "6"} py-${compact ? "3" : "4"}`}
                >
                  Team
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  W
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  L
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  PCT
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  GB
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  L10
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-700 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  STRK
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transformedStandings.map((team) => (
                <tr key={team.team_id} className="hover:bg-black/13 transition-colors">
                  <td
                    className={`px-${compact ? "4" : "6"} py-${compact ? "3" : "4"} text-black font-${compact ? "semibold" : "bold"} ${!compact && "text-lg"}`}
                  >
                    {team.rank}
                  </td>
                  <td className={`px-${compact ? "4" : "6"} py-${compact ? "3" : "4"}`}>
                    <div className={`flex items-center gap-${compact ? "2" : "3"}`}>
                      <span
                        className={`text-${compact ? "xs" : "sm"} font-${compact ? "semibold" : "bold"} text-orange-600 w-${compact ? "10" : "12"}`}
                      >
                        {team.abbr}
                      </span>
                      <span className={`text-white font-${compact ? "medium" : "semibold"} ${!compact && "text-lg"}`}>
                        {team.team}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`text-center text-white font-semibold px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                  >
                    {team.wins}
                  </td>
                  <td
                    className={`text-center text-white font-semibold px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                  >
                    {team.losses}
                  </td>
                  <td
                    className={`text-center text-white font-semibold px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                  >
                    {team.pct.toFixed(3)}
                  </td>
                  <td
                    className={`text-center text-white font-semibold px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                  >
                    {team.gb}
                  </td>
                  <td
                    className={`text-center text-white font-semibold px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                  >
                    {team.l10}
                  </td>
                  <td className={`text-center px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}>
                    <span
                      className={`font-${compact ? "semibold" : "bold"} ${team.strk.startsWith("W") ? "text-green-600" : team.strk.startsWith("L") ? "text-red-600" : "text-gray-600"}`}
                    >
                      {team.strk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
