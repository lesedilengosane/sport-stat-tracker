// app/api/teams/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    
    let query = supabase.from('teams').select('*');
    
    if (ids) {
      const idArray = ids.split(',');
      query = query.in('team_id', idArray);
    }
    
    const { data: teams, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(teams);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data: team, error } = await supabase
      .from('teams')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(team);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}