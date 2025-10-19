// ../components/games-grid.tsx
import { GameCard } from "./game-card";
import { Game } from "@/types/basketball";

interface Team {
  team_id: string; 
  name: string;
  logo: string;
}

interface Player {
  player_id: string;
  name: string;
  position?: string;
}




interface GamesGridProps {
  games: Game[];
}

export function GamesGrid({ games }: GamesGridProps) {
  //console.log('Gamecard ',games)
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-black mb-6">AVAILABLE GAMES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game,index ) => (
          <GameCard
            key={game.match_id || `game-${index}`} 
            match_id={game.match_id}
            date={game.date}
            time={game.time}
            location={game.location}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            booked={game.booked}
          />
        ))}
      </div>
    </div>
  );
}
