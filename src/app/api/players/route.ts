// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../DatabaseApi/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let query = supabase
      .from('players')
      .select('*')
      .order('jersey_number', { ascending: true });

    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    const { data: players, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(players);
  } catch (error) {
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