// app/api/pl/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../DatabaseApi/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const teamIds = searchParams.get('teamIds');

    console.log("API Request - teamId:", teamId, "teamIds:", teamIds);

    let query = supabase
      .from('players')
      .select('*') // Fetch all columns
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

    // Return all columns directly without transformation
    return NextResponse.json(players);

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
      .select(); // Return all columns for the inserted row

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]); // Return the inserted player

  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}