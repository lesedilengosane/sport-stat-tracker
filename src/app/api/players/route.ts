// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../DatabaseApi/supabaseClient';

// app/api/players/route.ts
// app/api/players/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const teamIds = searchParams.get('teamIds');

    console.log("API Request - teamId:", teamId, "teamIds:", teamIds);

    let query = supabase
      .from('players')
      .select('*')
      .order('jersey_number', { ascending: true });

    if (teamId) {
      console.log("Filtering by single teamId:", teamId);
      query = query.eq('team_id', teamId);
    } else if (teamIds) {
      console.log("Filtering by multiple teamIds:", teamIds);
      const idsArray = teamIds.split(',');
      query = query.in('team_id', idsArray);
    } else {
      console.log("No team filter - returning all players");
    }

    const { data: players, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Supabase returned players:", players);

    // Transform the data
    const transformedPlayers = players.map(player => ({
      id: player.player_id,
      first_name: player.first_name, 
      last_name: player.last_name,
      position: player.position || 'Unknown',
      avatar_url: player.image || '/avatars/player3.jpg',
      jersey_number: player.jersey_number,
      team_id: player.team_id
    }));

    console.log("Transformed players:", transformedPlayers);
    return NextResponse.json(transformedPlayers);

  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const playerData = await request.json();

    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}