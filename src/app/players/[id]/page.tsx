// app/player/[id]/page.tsx
import { supabase } from '../../api/DatabaseApi/supabaseClient';

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
    .select('*')
    .eq('player_id', id)
    .single<Player>();

  if (error || !player) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Player not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
          {player.first_name.charAt(0)}
          {player.last_name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {player.first_name} {player.last_name}
          </h1>
          <p className="text-gray-600">
            #{player.jersey_number} · {player.position}
          </p>
        </div>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Stat</th>
              <th className="px-4 py-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-2">Matches Played</td>
              <td className="px-4 py-2">{player.matches_played}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Points</td>
              <td className="px-4 py-2">{player.points}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Assists</td>
              <td className="px-4 py-2">{player.assists}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Rebounds</td>
              <td className="px-4 py-2">{player.rebounds}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Blocks</td>
              <td className="px-4 py-2">{player.blocks}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Steals</td>
              <td className="px-4 py-2">{player.steals}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Turnovers</td>
              <td className="px-4 py-2">{player.turnovers}</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Fouls</td>
              <td className="px-4 py-2">{player.fouls}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Shooting Stats */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Shooting</h2>
        <ul className="space-y-1">
          <li>
            2PT: {player.twoPointsMade}/{player.twoPointsAttempted}
          </li>
          <li>
            3PT: {player.threePointsMade}/{player.threePointsAttempted}
          </li>
          <li>
            FT: {player.freeThrowsMade}/{player.freeThrowsAttempted}
          </li>
        </ul>
      </div>
    </div>
  );
}
