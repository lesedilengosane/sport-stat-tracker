"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/app/utils/apiClient";
import React from 'react';
import Image from 'next/image';
import { Trash2, CheckCircle, X, UserX } from 'lucide-react';

// Define Player type
interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  image: string;
}

export default function PlayersList({ teamId }: { teamId: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [releasingPlayerId, setReleasingPlayerId] = useState<string | null>(null);
  const [releasedPlayers, setReleasedPlayers] = useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [releasedPlayerName, setReleasedPlayerName] = useState("");

  // Fetch players when component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPlayersByTeamId(teamId);
        const normalized = data.map((p) => ({
          player_id: p.player_id || p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          position: p.position,
          jersey_number: p.jersey_number,
          image: p.avatar_url,
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

  // Release player function
  const releasePlayer = async (playerId: string, playerName: string) => {
    setReleasingPlayerId(playerId);
    
    try {
      const response = await fetch('/api/releasePlayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to release player');
      }

      // Show success message
      setReleasedPlayerName(playerName);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      // Add to released players set for visual feedback
      setReleasedPlayers(prev => new Set(prev).add(playerId));
      
      // Remove player from local state after a delay for smooth animation
      setTimeout(() => {
        setPlayers(prev => prev.filter(p => p.player_id !== playerId));
        setReleasedPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(playerId);
          return newSet;
        });
      }, 2000);

    } catch (err) {
      console.error('Error releasing player:', err);
      alert('Failed to release player. Please try again.');
    } finally {
      setReleasingPlayerId(null);
    }
  };

  // Filter players by search query and exclude released players
  const filtered = useMemo(() => {
    const activePlayers = players.filter(p => !releasedPlayers.has(p.player_id));
    
    if (!query.trim()) return activePlayers;
    const lower = query.toLowerCase();
    return activePlayers.filter(
      (p) =>
        p.first_name.toLowerCase().includes(lower) ||
        p.last_name.toLowerCase().includes(lower) ||
        p.jersey_number.toString() === query
    );
  }, [players, query, releasedPlayers]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading players...</p>;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-green-300 flex items-center gap-3 max-w-md">
            <div className="flex items-center justify-center w-8 h-8 bg-green-400 rounded-full">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Player Released Successfully!</p>
              <p className="text-green-100 text-sm">{releasedPlayerName} has been released from the team.</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-200 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Player grid */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, idx) => {
          const isReleasing = releasingPlayerId === p.player_id;
          const isReleased = releasedPlayers.has(p.player_id);
          const playerFullName = `${p.first_name} ${p.last_name}`;

          return (
            <li
              key={`player-${p.player_id}-${idx}`}
              className={`group rounded-2xl bg-white border-2 p-6 shadow-lg transition-all duration-300 ${
                isReleased 
                  ? 'border-green-500 bg-green-50 scale-95 opacity-70 transform-gpu' 
                  : isReleasing
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-orange-200 hover:scale-105 hover:shadow-2xl hover:border-orange-400'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Player Info */}
                <Link href={`/player/${p.player_id}`} className="flex-1 block mb-4">
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={p.image || "/avatars/player3.jpg"}
                        alt={playerFullName}
                        fill
                        sizes="64px"
                        className="rounded-full object-cover border-2 border-orange-400"
                        loading="eager"
                      />
                    </div>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {playerFullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                            #{p.jersey_number}
                          </span>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                            {p.position}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Release Button */}
                <div className="mt-auto">
                  {isReleased ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-100 px-4 py-3 rounded-xl border-2 border-green-300 shadow-sm">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-semibold">Released</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => releasePlayer(p.player_id, playerFullName)}
                      disabled={isReleasing}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                        isReleasing
                          ? 'bg-orange-100 text-orange-700 border-orange-400 cursor-not-allowed shadow-inner'
                          : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border-red-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 hover:border-red-400 hover:shadow-lg hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isReleasing ? (
                        <>
                          <div className="h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Releasing...</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-5 w-5" />
                          <span className="text-sm">Release Player</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}

        {/* If no players found */}
        {filtered.length === 0 && (
          <li
            key="no-players"
            className="col-span-full text-center py-16 text-gray-600 bg-white border-2 border-orange-200 rounded-2xl shadow-lg"
          >
            <div className="flex flex-col items-center gap-3">
              <UserX className="h-12 w-12 text-orange-300" />
              <p className="text-lg font-semibold">
                {players.length === 0 ? 'No players found for this team.' : 'No players match your search.'}
              </p>
              <p className="text-sm text-gray-500">
                {players.length === 0 ? 'Add players to your team to get started.' : 'Try adjusting your search terms.'}
              </p>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}