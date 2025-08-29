import { GameCard } from "./game-card"

interface Team {
  name: string
  logo: string
}

interface Game {
  id: string
  date: string
  homeTeam: Team
  awayTeam: Team
}

interface GamesGridProps {
  games: Game[]
}

export function GamesGrid({ games }: GamesGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">AVAILABLE GAMES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} date={game.date} homeTeam={game.homeTeam} awayTeam={game.awayTeam} />
        ))}
      </div>
    </div>
  )
}
