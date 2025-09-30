"use client"
import Image from "next/image"

interface PlayerCard {
  id: number
  name: string
  image: string
  assists: number
  rebounds: number
  gamesPlayed: number
}

interface PlayerCardsProps {
  players?: PlayerCard[]
}

export function PlayerCards({ players }: PlayerCardsProps) {
  // Default sample data - should be replaced with data from players table
  // Query: SELECT player_id, first_name || ' ' || last_name as name,
  //        assists/matches_played as assists, rebounds/matches_played as rebounds,
  //        matches_played FROM players WHERE matches_played > 0
  const defaultPlayers: PlayerCard[] = [
    {
      id: 1,
      name: "Giannis Antetokounmpo",
      image: "/basketball-dunk.png",
      assists: 5.5,
      rebounds: 11.2,
      gamesPlayed: 82,
    },
    {
      id: 2,
      name: "LeBron James",
      image: "/basketball-player-shooting.png",
      assists: 8.1,
      rebounds: 7.5,
      gamesPlayed: 71,
    },
    {
      id: 3,
      name: "Stephen Curry",
      image: "/basketball-player-three-pointer.jpg",
      assists: 6.3,
      rebounds: 5.2,
      gamesPlayed: 79,
    },
    {
      id: 4,
      name: "Kevin Durant",
      image: "/basketball-player-mid-range-shot.jpg",
      assists: 5.2,
      rebounds: 6.8,
      gamesPlayed: 75,
    },
    {
      id: 5,
      name: "Luka Dončić",
      image: "/basketball-player-dribbling.png",
      assists: 9.2,
      rebounds: 8.9,
      gamesPlayed: 66,
    },
    {
      id: 6,
      name: "Joel Embiid",
      image: "/basketball-center-player.jpg",
      assists: 4.2,
      rebounds: 10.2,
      gamesPlayed: 66,
    },
  ]

  const displayPlayers = players || defaultPlayers

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayPlayers.map((player) => (
          <div
            key={player.id}
            className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            {/* Player Image - 80% of card */}
            <div className="relative aspect-[3/4]">
              <Image
                src={player.image || "/placeholder.svg"}
                alt={player.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Player Info Footer - 20% of card */}
            <div className="p-3 bg-black/60 backdrop-blur-sm">
              <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">{player.name}</h3>
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <div className="text-gray-400">AS</div>
                  <div className="text-white font-semibold">{player.assists}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">REB</div>
                  <div className="text-white font-semibold">{player.rebounds}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">G/A</div>
                  <div className="text-white font-semibold">{player.gamesPlayed}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
