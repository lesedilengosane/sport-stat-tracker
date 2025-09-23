import Image from "next/image";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";
import PlayersList from "./PlayersList";

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
}

export const revalidate = 60; // ISR

export default async function PlayersPage() {
  const { data: players, error } = await supabase
    .from("players")
    .select("player_id, first_name, last_name, position, jersey_number")
    .order("last_name", { ascending: true });

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load players: {error.message}
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="p-6 text-gray-700">No players found.</div>
    );
  }

  return (
    <div className="relative w-full h-screen scroll overflow-hidden bg-black">
      {/* Background Image */}
      <Image
        src="/bgr.jpg"
        alt="Basketball background"
        fill
        priority
        className="object-cover opacity-100 scale-100"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full px-6 md:px-16 py-12">
        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-orange-500 mb-8">
          ALL PLAYERS
        </h1>

        {/* Players list container */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-h-[70vh] overflow-y-auto">
          <PlayersList players={players as Player[]} />
        </div>
      </div>
    </div>
  );
}
