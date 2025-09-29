"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { apiClient } from "@/app/utils/apiClient";

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
}

interface PlayerDashboardProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDashboard({ params }: PlayerDashboardProps) {
  // Unwrap the params promise
  const { id } = use(params);
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!user || !user.user_id) {
        setError("You must be logged in as a coach");
        setLoading(false);
        return;
      }

      try {
        const coachId = user.user_id;
        const teamPlayers = await apiClient.getTeamPlayers(coachId);

        const foundPlayer = teamPlayers.find((p: Player) => p.player_id === id);

        if (!foundPlayer) {
          setError("Player not found");
        } else {
          setPlayer(foundPlayer);
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load player");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id, user]);

  if (loading)
    return <div className="p-6 text-center text-white">Loading...</div>;
  if (error || !player)
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-100">
          Player not found
        </h1>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Image
        src="/bgr.jpg"
        alt="Basketball"
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="relative z-10 p-6 space-y-10">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 p-6 shadow-lg flex flex-col sm:flex-row items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur-sm">
            {player.first_name.charAt(0)}
            {player.last_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {player.first_name} {player.last_name}
            </h1>
            <p className="mt-1 text-indigo-100">
              #{player.jersey_number} · {player.position}
            </p>
          </div>
        </div>

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
              className="rounded-xl bg-white/10 p-4 text-center shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-gray-200">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white/10 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Shooting</h2>
          <div className="grid gap-4 sm:grid-cols-3 text-center">
            <div>
              <p className="text-sm text-gray-200">2PT</p>
              <p className="text-lg font-bold text-white">
                {player.twoPointsMade}/{player.twoPointsAttempted}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-200">3PT</p>
              <p className="text-lg font-bold text-white">
                {player.threePointsMade}/{player.threePointsAttempted}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-200">FT</p>
              <p className="text-lg font-bold text-white">
                {player.freeThrowsMade}/{player.freeThrowsAttempted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
