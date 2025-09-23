// app/api/matches/assign-analyst/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';

export async function POST(req: Request) {
  try {
    const { matchId, analystId } = await req.json();

    if (!matchId || !analystId) {
      return NextResponse.json(
        { error: 'matchId and analystId are required ❌' },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch the match first
    const { data: matchData, error: fetchError } = await supabase
      .from('matches')
      .select('match_id, analyst')
      .eq('match_id', matchId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!matchData) {
      return NextResponse.json({ error: 'Match not found ❌' }, { status: 404 });
    }

    // 2️⃣ Check if analyst is already assigned
    if (matchData.analyst) {
      return NextResponse.json(
        { error: 'This match already has an analyst assigned ❌' },
        { status: 400 }
      );
    }

    // 3️⃣ Proceed with update
    const { data, error: updateError } = await supabase
      .from('matches')
      .update({ analyst: analystId })
      .eq('match_id', matchId)
      .select();

    if (updateError) {
      // Friendly error messages for known constraints
      let friendlyMessage = updateError.message;
      if (updateError.message.includes('not an analyst')) {
        friendlyMessage = 'You cannot book this game because you are not an analyst. ❌';
      }
      return NextResponse.json({ error: friendlyMessage }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Analyst assigned successfully ✅',
      match: data[0],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to assign analyst ❌' },
      { status: 500 }
    );
  }
}
