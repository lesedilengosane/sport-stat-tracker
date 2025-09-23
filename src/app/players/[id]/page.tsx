// app/players/[id]/page.tsx
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';
import Image from 'next/image';

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

export default async function PlayerDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const { data: player, error } = await supabase
  .from('players')
  .select(`
    player_id,
    team_id,
    first_name,
    last_name,
    position,
    jersey_number,
    turnovers,
    fouls,
    points,
    assists,
    rebounds,
    blocks,
    twoPointsMade,
    twoPointsAttempted,
    threePointsMade,
    threePointsAttempted,
    freeThrowsMade,
    freeThrowsAttempted,
    matches_played,
    steals
  `)
  .eq('player_id', id)
  .single<Player>();


  if (error || !player) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-100">Player not found</h1>
        {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background Image */}
      <Image
        src="/bgr.jpg" // hero-style background
        alt="Basketball"
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="relative z-10 p-6 space-y-10">
        {/* Hero Card */}
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

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Matches Played', value: player.matches_played },
            { label: 'Points', value: player.points },
            { label: 'Assists', value: player.assists },
            { label: 'Rebounds', value: player.rebounds },
            { label: 'Blocks', value: player.blocks },
            { label: 'Steals', value: player.steals },
            { label: 'Turnovers', value: player.turnovers },
            { label: 'Fouls', value: player.fouls },
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

        {/* Shooting Stats */}
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
