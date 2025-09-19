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
    <div>
      {/* Search input + button */}
      <div className="mb-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or jersey #"
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        {/*
        <button
          onClick={() => setQuery(query.trim())}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Search
        </button>
*/}
      </div>

      {/* List */}
      <ul className="divide-y divide-gray-200 rounded-lg border bg-white shadow">
        {filtered.map((p) => (
          <li key={p.player_id} className="hover:bg-gray-50">
            <Link
              href={`/players/${p.player_id}`}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="text-lg font-medium">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  #{p.jersey_number} · {p.position}
                </p>
              </div>
              <span className="text-blue-600 text-sm font-semibold">
                View →
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="p-4 text-gray-500">No players match your search.</li>
        )}
      </ul>
    </div>
  );
}
