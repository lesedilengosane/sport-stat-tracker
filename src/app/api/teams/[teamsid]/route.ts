// /app/api/teams/[teamsid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../DatabaseApi/supabaseClient";

export async function GET(req: NextRequest) {
  // Extract teamsid from the URL
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const teamId = segments[segments.length - 1]; // last segment

  try {
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("team_id, team_name, created_at, icon_url, coach_id")
      .eq("team_id", teamId)
      .maybeSingle();

    if (teamError) throw teamError;
    if (!teamData) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Fetch coach
    let coachData = null;
    if (teamData.coach_id) {
      const { data: coach, error: coachError } = await supabase
        .from("coaches")
        .select("coach_id, user_id")
        .eq("coach_id", teamData.coach_id)
        .maybeSingle();

      if (coachError) throw coachError;

      if (coach) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("first_name, last_name, role")
          .eq("user_id", coach.user_id)
          .maybeSingle();

        if (userError) throw userError;

        coachData = { ...coach, user };
      }
    }

    // Fetch players
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select(
        "player_id, first_name, last_name, position, jersey_number, points, assists, rebounds, blocks, steals"
      )
      .eq("team_id", teamId)
      .order("jersey_number", { ascending: true });

    if (playersError) throw playersError;

    // Fetch matches
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        match_id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        match_date,
        completed,
        home_team:home_team_id (team_name, team_id, icon_url),
        away_team:away_team_id (team_name, team_id, icon_url)
      `)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

    if (matchesError) throw matchesError;

    return NextResponse.json({
      team: { ...teamData, coach: coachData },
      players,
      matches,
    });
  } catch (err: any) {
    console.error("Error fetching team data:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch team data", details: err.message },
      { status: 500 }
    );
  }
}
