import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../DatabaseApi/supabaseClient";

// GET player stats with player details joined
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    const teamId = searchParams.get("teamId");

    // Query player_stats with player details joined
    let query = supabase
      .from("player_stats")
      .select(
        `
        id,
        created_at,
        match_id,
        player_id,
        points,
        assists,
        rebounds,
        blocks,
        turnovers,
        steals,
        fouls,
        twoPointsMade,
        twoPointsAttempted,
        threePointsMade,
        threePointsAttempted,
        freeThrowsMade,
        freeThrowsAttempted,
        players:player_id (
          player_id,
          team_id,
          first_name,
          last_name,
          jersey_number,
          position
        )
      `
      )
      .order("created_at", { ascending: false });

    if (matchId) {
      query = query.eq("match_id", matchId);
    }
    if (teamId) {
      query = query.eq("players.team_id", teamId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new player stat
export async function POST(request: NextRequest) {
  try {
    const statData = await request.json();

    const { data, error } = await supabase
      .from("player_stats")
      .insert([statData])
      .select();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
