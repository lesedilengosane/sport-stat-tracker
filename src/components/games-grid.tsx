"use client";

import { GameCard, GameCardSkeleton } from "./game-card";
import { Game } from "@/types/basketball";
import { memo } from "react";

interface GamesGridProps {
  games: Game[];
}

export const GamesGrid = memo(({ games }: GamesGridProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-black mb-6">AVAILABLE GAMES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, index) => (
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
});

GamesGrid.displayName = "GamesGrid";