// app/api/DatabaseApi/getCoachTeam/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../DatabaseApi/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing required field: user_id" },
        { status: 400 }
      );
    }

    // 1. Get coach record
    const { data: coachData, error: coachError } = await supabase
      .from("coaches")
      .select("team_id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (coachError) {
      return NextResponse.json(
        { error: "Error fetching coach data: " + coachError.message },
        { status: 500 }
      );
    }

    if (!coachData) {
      return NextResponse.json(
        { team_id: null, team_name: null },
        { status: 200 }
      );
    }

    const team_id = coachData?.team_id || null;

    if (!team_id) {
      return NextResponse.json(
        { team_id: null, team_name: null },
        { status: 200 }
      );
    }

    // 2. Get team name from teams table
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("team_name")
      .eq("team_id", team_id)
      .single();

    if (teamError) {
      return NextResponse.json(
        { error: "Error fetching team data: " + teamError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { team_id, team_name: teamData?.team_name || null },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error in getCoachTeam route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}