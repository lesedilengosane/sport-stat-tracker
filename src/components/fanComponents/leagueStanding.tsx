"use client"

interface TeamStanding {
  rank: number
  team: string
  abbr: string
  wins: number
  losses: number
  pct: number
  gb: string
  l10: string
  strk: string
}

interface LeagueStandingsProps {
  standings?: TeamStanding[]
  compact?: boolean
}

export function LeagueStandings({ standings, compact = false }: LeagueStandingsProps) {
  // const [conference, setConference] = useState<"eastern" | "western">("eastern")

  // Default sample data - should be calculated from matches table
  // Query: Calculate wins/losses from matches where team_id = home_team_id OR team_id = away_team_id
  const defaultStandings: TeamStanding[] = [
    { rank: 1, team: "Boston Celtics", abbr: "BOS", wins: 49, losses: 23, pct: 0.681, gb: "-", l10: "7-3", strk: "W4" },
    {
      rank: 2,
      team: "Milwaukee Bucks",
      abbr: "MIL",
      wins: 47,
      losses: 25,
      pct: 0.653,
      gb: "2.0",
      l10: "6-4",
      strk: "W2",
    },
    {
      rank: 3,
      team: "Philadelphia 76ers",
      abbr: "PHI",
      wins: 45,
      losses: 27,
      pct: 0.625,
      gb: "4.0",
      l10: "7-3",
      strk: "L1",
    },
    { rank: 4, team: "Miami Heat", abbr: "MIA", wins: 43, losses: 29, pct: 0.597, gb: "6.0", l10: "5-5", strk: "W1" },
  ]

  const displayStandings = standings || defaultStandings

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-${compact ? "2xl" : "3xl"} font-bold text-white`}>League Standings</h2>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th
                  className={`text-left text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "4" : "6"} py-${compact ? "3" : "4"}`}
                >
                  Rank
                </th>
                <th
                  className={`text-left text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "4" : "6"} py-${compact ? "3" : "4"}`}
                >
                  Team
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  W
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  L
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  PCT
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  GB
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  L10
                </th>
                <th
                  className={`text-center text-${compact ? "xs" : "sm"} font-semibold text-gray-400 uppercase tracking-wider px-${compact ? "2" : "4"} py-${compact ? "3" : "4"}`}
                >
                  STRK
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {displayStandings.map((team) => (
                <tr key={team.rank} className="hover:bg-white/5 transition-colors">
                  <td
                    className={`px-${compact ? "4" : "6"} py-${compact ? "3" : "4"} text-white font-${compact ? "semibold" : "bold"} ${!compact && "text-lg"}`}
                  >
                    {team.rank}
                  </td>
                  <td className={`px-${compact ? "4" : "6"} py-${compact ? "3" : "4"}`}>
                    <div className={`flex items-center gap-${compact ? "2" : "3"}`}>
                      <span
                        className={`text-${compact ? "xs" : "sm"} font-${compact ? "semibold" : "bold"} text-gray-400 w-${compact ? "10" : "12"}`}
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
                    {team.pct}
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
                      className={`font-${compact ? "semibold" : "bold"} ${team.strk.startsWith("W") ? "text-green-400" : "text-red-400"}`}
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
