// sport-stat-tracker\src\components\coach-games-grid.tsx

import { CoachGameCard } from "./coach-game-card";
import type { Game } from "@/types/basketball";

interface CoachGamesGridProps {
  games: Game[];
}

export function CoachGamesGrid({ games }: CoachGamesGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-black mb-6">AVAILABLE GAMES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, index) => (
          <CoachGameCard
            key={game.match_id || `game-${index}`}
            match_id={game.match_id}
            date={game.date}
            time={game.time}
            location={game.location}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            homeLineup={game.homeLineup}
            awayLineup={game.awayLineup}
          />
        ))}
      </div>
    </div>
  );
}
