"use client"

interface Game {
  homeTeam: string
  homeAbbr: string
  awayTeam: string
  awayAbbr: string
  date: string
  time: string
}

interface GameScheduleProps {
  games?: Game[]
  compact?: boolean
}

export function GameSchedule({ games, compact = false }: GameScheduleProps) {
  // Default sample data - should be replaced with data from matches table
  // Query: SELECT m.*, ht.team_name as home_team, at.team_name as away_team
  //        FROM matches m
  //        JOIN teams ht ON m.home_team_id = ht.team_id
  //        JOIN teams at ON m.away_team_id = at.team_id
  //        WHERE m.match_date > NOW() ORDER BY m.match_date LIMIT 3
  const defaultGames: Game[] = [
    {
      homeTeam: "Phoenix Suns",
      homeAbbr: "PHX",
      awayTeam: "Dallas Mavericks",
      awayAbbr: "DAL",
      date: "Tomorrow",
      time: "7:30 PM ET",
    },
    {
      homeTeam: "Miami Heat",
      homeAbbr: "MIA",
      awayTeam: "Philadelphia 76ers",
      awayAbbr: "PHI",
      date: "Oct 14",
      time: "8:00 PM ET",
    },
    {
      homeTeam: "Boston Celtics",
      homeAbbr: "BOS",
      awayTeam: "Milwaukee Bucks",
      awayAbbr: "MIL",
      date: "Oct 15",
      time: "7:00 PM ET",
    },
  ]

  const displayGames = games || defaultGames

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{compact ? "Game Schedule" : "Full Schedule"}</h2>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className={`space-y-${compact ? "2" : "4"} p-${compact ? "4" : "6"}`}>
          {displayGames.map((game, index) => (
            <div
              key={index}
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-${compact ? "4" : "6"} hover:bg-white/10 transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={`flex items-center gap-${compact ? "3" : "4"} mb-${compact ? "2" : "3"}`}>
                    <span
                      className={`text-${compact ? "xs" : "sm"} font-${compact ? "semibold" : "bold"} text-gray-400 w-${compact ? "10" : "12"}`}
                    >
                      {game.awayAbbr}
                    </span>
                    <span
                      className={`text-white font-${compact ? "medium" : "semibold"} text-${compact ? "base" : "lg"}`}
                    >
                      {game.awayTeam}
                    </span>
                  </div>
                  <div className={`flex items-center gap-${compact ? "3" : "4"}`}>
                    <span
                      className={`text-${compact ? "xs" : "sm"} font-${compact ? "semibold" : "bold"} text-gray-400 w-${compact ? "10" : "12"}`}
                    >
                      {game.homeAbbr}
                    </span>
                    <span
                      className={`text-white font-${compact ? "medium" : "semibold"} text-${compact ? "base" : "lg"}`}
                    >
                      {game.homeTeam}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-${compact ? "sm" : "lg"} font-${compact ? "semibold" : "bold"} text-orange-500 ${!compact && "mb-1"}`}
                  >
                    {game.date}
                  </div>
                  <div className={`text-${compact ? "xs" : "sm"} text-gray-400`}>{game.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {compact && (
          <div className="border-t border-white/10 p-4 text-center">
            <button className="text-orange-500 hover:text-orange-400 font-medium text-sm">View All Games</button>
          </div>
        )}
      </div>
    </div>
  )
}
