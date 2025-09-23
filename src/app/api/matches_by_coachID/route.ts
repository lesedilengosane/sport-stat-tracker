// /app/api/matches_by_coachID/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get("coachId");

    if (!coachId) {
      return NextResponse.json({ error: "coachId is required" }, { status: 400 });
    }

    // Step 1: find all teams coached by this coach
    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select("team_id")
      .eq("coach_id", coachId);

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json({ error: "No teams found for this coach" }, { status: 404 });
    }

    const teamIds = teams.map(t => t.team_id);

    // Step 2: fetch upcoming matches for these teams
    const orFilter = teamIds.map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(',');

    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .or(orFilter)
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true });

    if (matchesError) {
      return NextResponse.json({ error: matchesError.message }, { status: 500 });
    }

    return NextResponse.json(matches);

  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
