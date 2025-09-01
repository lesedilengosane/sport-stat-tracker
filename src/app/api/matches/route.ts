// app/api/matches/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(matches);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data: match, error } = await supabase
      .from('matches')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(match);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}