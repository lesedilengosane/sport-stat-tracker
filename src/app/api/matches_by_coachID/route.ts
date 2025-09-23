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
      console.error("Error fetching teams:", teamError);
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    if (!teams || teams.length === 0) {
      console.log(`No teams found for coach ${coachId}`);
      return NextResponse.json([]); // return empty array instead of error
    }

    const teamIds = teams.map(t => t.team_id);
    console.log("Teams for coach:", teamIds);

    // Step 2: fetch upcoming matches for these teams
    // Supabase 'or' syntax requires multiple conditions joined by commas
    const orFilter = teamIds
      .map(id => `home_team_id.eq.${id},away_team_id.eq.${id}`)
      .join(",");

    console.log("OR filter:", orFilter);

    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .or(orFilter)
      // optional: remove future-date filter for testing
      //.gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true });

    if (matchesError) {
      console.error("Error fetching matches:", matchesError);
      return NextResponse.json({ error: matchesError.message }, { status: 500 });
    }

    console.log("Matches fetched:", matches);

    return NextResponse.json(matches || []);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
