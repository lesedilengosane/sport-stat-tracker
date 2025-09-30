"use client"

interface Game {
  home_team: string
  away_team: string
  date: string
  time: string
}

interface GameScheduleProps {
  games?: Game[]
  compact?: boolean
}

export function GameSchedule({ games, compact = false }: GameScheduleProps) {
  // Use the provided games data or empty array if none provided
  const displayGames = games || []

  // If no games provided, show nothing or a message
  if (displayGames.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">{compact ? "Game Schedule" : "Full Schedule"}</h2>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden p-6">
          <p className="text-white text-center">No upcoming games scheduled</p>
        </div>
      </div>
    )
  }

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
                      {/* Generate abbreviation from away team name - take first 3 letters */}
                      {game.away_team.substring(0, 3).toUpperCase()}
                    </span>
                    <span
                      className={`text-white font-${compact ? "medium" : "semibold"} text-${compact ? "base" : "lg"}`}
                    >
                      {game.away_team}
                    </span>
                  </div>
                  <div className={`flex items-center gap-${compact ? "3" : "4"}`}>
                    <span
                      className={`text-${compact ? "xs" : "sm"} font-${compact ? "semibold" : "bold"} text-gray-400 w-${compact ? "10" : "12"}`}
                    >
                      {/* Generate abbreviation from home team name - take first 3 letters */}
                      {game.home_team.substring(0, 3).toUpperCase()}
                    </span>
                    <span
                      className={`text-white font-${compact ? "medium" : "semibold"} text-${compact ? "base" : "lg"}`}
                    >
                      {game.home_team}
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