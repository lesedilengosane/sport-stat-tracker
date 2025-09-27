import { NextResponse } from "next/server";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

// GET /api/coach/fetchTeamPlayers?coachId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get("coachId");

    if (!coachId) {
      return NextResponse.json({ error: "Missing coachId" }, { status: 400 });
    }

    // 1. Find the coach's team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("team_id")
      .eq("coach_id", coachId)
      .maybeSingle();

    if (teamError) throw teamError;
    if (!team) {
      return NextResponse.json({ error: "No team found for this coach" }, { status: 404 });
    }

    // 2. Fetch all players belonging to that team
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", team.team_id);

    if (playersError) throw playersError;

    return NextResponse.json(players, { status: 200 });
  } catch (err: any) {
    console.error("[fetchTeamPlayers] Error:", err.message || err);
    return NextResponse.json(
      { error: "Failed to fetch team players" },
      { status: 500 }
    );
  }
}
