"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";

interface Player {
  player_id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  turnovers: number;
  fouls: number;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  matches_played: number;
  steals: number;
  image: string; // ✅ Added this property
}

interface PlayerDashboardProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDashboard({ params }: PlayerDashboardProps) {
  const { id } = use(params);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await fetch(`/api/players/${id}`);
        if (!res.ok) throw new Error("Failed to fetch player");
        const foundPlayer: Player = await res.json();

        if (!foundPlayer) setError("Player not found");
        else setPlayer(foundPlayer);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load player");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 font-semibold text-lg">
        Loading...
      </div>
    );

  if (error || !player)
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-700">
          Player not found
        </h1>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-100 text-gray-900">
      <Image
        src="/bgr.jpg"
        alt="Basketball court background"
        fill
        className="object-cover opacity-20"
        priority
      />

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-10">
        {/* Header Card */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-orange-200 p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-start gap-8">
          {/* ✅ Player Image (same layout as first version) */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-orange-400 shadow-lg flex-shrink-0">
            <Image
              src={player.image || "/placeholder.svg?height=400&width=300"}
              alt={`${player.first_name} ${player.last_name}`}
              fill
              className="object-cover"
            />
          </div>

          {/* ✅ Player Info beside image */}
          <div className="flex flex-col justify-center text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
              {player.first_name} {player.last_name}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              #{player.jersey_number} · {player.position}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Matches Played", value: player.matches_played },
            { label: "Points", value: player.points },
            { label: "Assists", value: player.assists },
            { label: "Rebounds", value: player.rebounds },
            { label: "Blocks", value: player.blocks },
            { label: "Steals", value: player.steals },
            { label: "Turnovers", value: player.turnovers },
            { label: "Fouls", value: player.fouls },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white border border-orange-100 p-4 text-center shadow-sm hover:shadow-md transition-transform hover:scale-[1.02]"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Shooting Section */}
        <div className="rounded-xl bg-white border border-orange-100 p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Shooting Statistics
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-center">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">2PT</p>
              <p className="text-lg font-bold text-orange-600">
                {player.twoPointsMade}/{player.twoPointsAttempted}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">3PT</p>
              <p className="text-lg font-bold text-orange-600">
                {player.threePointsMade}/{player.threePointsAttempted}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">FT</p>
              <p className="text-lg font-bold text-orange-600">
                {player.freeThrowsMade}/{player.freeThrowsAttempted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
