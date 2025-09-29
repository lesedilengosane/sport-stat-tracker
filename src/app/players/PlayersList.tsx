// app/players/PlayersList.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/app/utils/apiClient"; // ✅ import apiClient

// Define Player type
interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  image_url?: string;
}

export default function PlayersList({ teamId }: { teamId: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch players when component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPlayersByTeamId(teamId);
        const normalized = data.map((p) => ({
          player_id: p.player_id || p.id, // fallback to `id`
          first_name: p.first_name,
          last_name: p.last_name,
          position: p.position,
          jersey_number: p.jersey_number,
          image_url: p.image_url,
        }));
        setPlayers(normalized);
      } catch (err) {
        console.error("Failed to fetch players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  // Filter players by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return players;
    const lower = query.toLowerCase();
    return players.filter(
      (p) =>
        p.first_name.toLowerCase().includes(lower) ||
        p.last_name.toLowerCase().includes(lower) ||
        p.jersey_number.toString() === query
    );
  }, [players, query]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading players...</p>;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      {/* Search box */}
      <div className="mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or jersey #"
          className="w-full rounded-xl bg-black/30 backdrop-blur-md border border-white/20 px-4 py-3 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Player grid */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, idx) => (
          <li
            key={`player-${p.player_id}-${idx}`}
            className="group rounded-2xl bg-white border-2 border-yellow-400 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Link href={`/players/${p.player_id}`} className="block h-full">
              <div className="flex items-center gap-4">
                <img
                  src={p.image_url || "/avatars/player3.jpg"} // fixed fallback
                  alt={`${p.first_name} ${p.last_name}`}
                  className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400"
                />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {p.first_name} {p.last_name}
                  </h3>
                  <span className="text-sm font-bold text-yellow-600">
                    #{p.jersey_number}
                  </span>
                  <span className="text-sm text-gray-600">{p.position}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}

        {/* If no players found */}
        {filtered.length === 0 && (
          <li
            key="no-players" // ✅ Unique key for fallback
            className="col-span-full text-center py-10 text-gray-600 
               bg-white border-2 border-yellow-400
               rounded-2xl shadow-lg"
          >
            No players match your search.
          </li>
        )}
      </ul>
    </section>
  );
}
