"use client";

import { GameCard, GameCardSkeleton, UserProvider } from "./game-card";
import { Game } from "@/types/basketball";
import { memo } from "react";

interface GamesGridProps {
  games: Game[];
}

export const GamesGrid = memo(({ games }: GamesGridProps) => {
  return (
    <UserProvider>
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-black mb-6">AVAILABLE GAMES</h2>
        {games.length === 0 ? (
          <div className="text-center text-slate-500">No games available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <GameCard key={game.match_id} {...game} />
            ))}
          </div>
        )}
      </div>
    </UserProvider>
  );
});

GamesGrid.displayName = "GamesGrid";
