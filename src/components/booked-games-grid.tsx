import { GameCard } from "./game-card";
import { Game } from "@/types/basketball";

interface GamesGridProps {
  games: Game[];
}

export function BookedGamesGrid({ games }: GamesGridProps) {
  // Filter only booked games
  const bookedGames = games.filter(game => game.booked === true);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-black mb-6">BOOKED GAMES</h2>
      
      {bookedGames.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">No booked games yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Games you book for analysis will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookedGames.map((game) => (
            <GameCard
              key={game.match_id}
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
      )}
    </div>
  );
}