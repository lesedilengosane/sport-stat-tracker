// ../components/games-grid.tsx
import { GameCard } from "./game-card";

interface Team {
  id: string; // ← Make sure this is here
  name: string;
  logo: string;
}

interface Game {
  id: string;
  date: string;
  homeTeam: Team;
  awayTeam: Team;
  homeLineup?: any[];
  awayLineup?: any[];
}

interface GamesGridProps {
  games: Game[];
}

export function GamesGrid({ games }: GamesGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">AVAILABLE GAMES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            date={game.date}
            homeTeam={game.homeTeam} // ← This should include id
            awayTeam={game.awayTeam} // ← This should include id
            homeLineup={game.homeLineup}
            awayLineup={game.awayLineup}
          />
        ))}
      </div>
    </div>
  );
}
