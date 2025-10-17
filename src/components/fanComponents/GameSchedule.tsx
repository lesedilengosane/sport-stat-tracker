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
        <h2 className="text-2xl font-bold text-black mb-4">{compact ? "Game Schedule" : "Full Schedule"}</h2>
        <div className="bg-white rounded-xl overflow-hidden p-6 shadow-lg">
          <p className="text-gray-600 text-center">No upcoming games scheduled</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{compact ? "Game Schedule" : "Full Schedule"}</h2>
      <div className="bg-black/10  border border-white/60 rounded-xl overflow-hidden shadow-lg">
        <div className={`space-y-${compact ? "2" : "4"} p-${compact ? "4" : "6"}`}>
          {displayGames.map((game, index) => (
            <div
              key={index}
              className={`bg-orange-50  rounded-lg p-${compact ? "4" : "6"} hover:bg-orange-100 transition-colors`}
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
                      className={`text-black font-${compact ? "medium" : "semibold"} text-${compact ? "base" : "lg"}`}
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
                      className={`text-black font-${compact ? "medium" : "semibold"} text-${compact ? "base" : "lg"}`}
                    >
                      {game.home_team}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-${compact ? "sm" : "lg"} font-${compact ? "semibold" : "bold"} text-orange-600 ${!compact && "mb-1"}`}
                  >
                    {game.date}
                  </div>
                  <div className={`text-${compact ? "xs" : "sm"} text-gray-600`}>{game.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {compact && (
          <div className="border-t-2 border-orange-200 p-4 text-center bg-orange-50">
            <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm">View All Games</button>
          </div>
        )}
      </div>
    </div>
  )
}
