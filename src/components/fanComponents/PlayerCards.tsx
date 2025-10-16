"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  avatar_url: string;
  jersey_number: number;
  team_id: string;
}

export default function PlayersList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch("/api/players");
        if (!res.ok) throw new Error("Failed to fetch players");
        const data: Player[] = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  if (loading) return <p className="text-center">Loading players...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {players.map((player) => (
        <Link key={player.id} href={`/player/${player.id}`}>
          
          <Card className="shadow-lg rounded-2xl cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="flex flex-col items-center p-4">
              <img
                src={player.avatar_url}
                alt={`${player.first_name} ${player.last_name}`}
                className="w-24 h-24 rounded-full object-cover mb-3"
              />
              <h3 className="text-lg font-semibold">
                {player.first_name} {player.last_name}
              </h3>
              <p className="text-gray-500">
                #{player.jersey_number} • {player.position}
              </p>
            
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
