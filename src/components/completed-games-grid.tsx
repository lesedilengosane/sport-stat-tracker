
import { CompletedGameCard } from "./completed-game-card";

interface Team {
  team_id: string;
  name: string;
  logo: string;
  color: string;
  score: number;
  timeouts: number;
  fouls: number;
  players: Player[];
}

interface Player {
  player_id: string;
  name: string;
  position: string;
}

interface Game {
  booked:boolean
  away_score?:number;
  home_score?:number;
  match_id: string
  analyst?: string
  completed: boolean     
  date: string
  time: string
  location: string
  homeTeam: Team
  awayTeam: Team
  homeLineup?: Player[]
  awayLineup?: Player[]
  isSampleData?: boolean
}


interface GamesGridProps {
  games: Game[];
}

export function CompletedGamesGrid({ games }: GamesGridProps) {
  //console.log('Gamecard ',games)
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Completed Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <CompletedGameCard
            key={game.match_id} 
            match_id={game.match_id}
            date={game.date}
            time={game.time}
            away_score={game.away_score ?? 0}
            home_score={game.home_score ?? 0}
            completed={game.completed}
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
