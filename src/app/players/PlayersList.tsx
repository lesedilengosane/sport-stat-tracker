'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
}

export default function PlayersList({ players }: { players: Player[] }) {
  const [query, setQuery] = useState('');

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
        {filtered.map((p) => (
          <li
            key={p.player_id}
            className="
              group rounded-2xl
              bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700
              bg-opacity-80 backdrop-blur-xl
              p-6 shadow-lg
              transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
            "
          >
            <Link href={`/players/${p.player_id}`} className="block h-full">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-1">
                    {p.first_name} {p.last_name}
                  </h3>
                  <p className="text-sm text-gray-200">
                    #{p.jersey_number} · {p.position}
                  </p>
                </div>

                <div className="mt-6 text-right">
                  <span className="text-sm font-semibold text-pink-300 group-hover:text-white">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="col-span-full text-center py-10 text-gray-300 
                         bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-800
                         bg-opacity-70 backdrop-blur-xl rounded-2xl shadow-lg">
            No players match your search.
          </li>
        )}
      </ul>
    </section>
  );
}
