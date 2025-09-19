import { supabase } from '@/app/api/DatabaseApi/supabaseClient';
import PlayersList from './PlayersList';

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
}

export const revalidate = 60; // optional: ISR

export default async function PlayersPage() {
  const { data: players, error } = await supabase
    .from('players')
    .select('player_id, first_name, last_name, position, jersey_number')
    .order('last_name', { ascending: true });

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
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">All Players</h1>
      <PlayersList players={players} />
    </div>
  );
}
