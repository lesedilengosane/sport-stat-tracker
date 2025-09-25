// ../components/games-grid.tsx
import { GameCard } from "./game-card";

interface Team {
  team_id: string; // ← Make sure this is here
  name: string;
  logo: string;
}

interface Player {
  player_id: string;
  name: string;
  position?: string;
}

interface Game {

  match_id: string
  date: string
  time: string
  location: string
  homeTeam: Team
  awayTeam: Team
  isBooked?: boolean


  homeLineup?: any[];
  awayLineup?: any[];
}

interface GamesGridProps {
  games: Game[];
}

export function GamesGrid({ games }: GamesGridProps) {
  //console.log('Gamecard ',games)
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">AVAILABLE GAMES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.match_id} 
            match_id={game.match_id}

            date={game.date}
            time={game.time}
            location={game.location}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            isBooked={game.isBooked}
          />
        ))}
      </div>
    </div>
  );
}
