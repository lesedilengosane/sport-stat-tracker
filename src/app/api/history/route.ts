import { NextResponse } from "next/server";
import { supabase } from "../DatabaseApi/supabaseClient";

export async function GET() {
  try {
    // 🟠 1. Fetch all teams
    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select("team_id, team_name, coach_id, icon_url, lineup, created_at");

    if (teamError) throw teamError;

    // 🟢 2. Fetch all players
    const { data: players, error: playerError } = await supabase
      .from("players")
      .select(
        "player_id, first_name, last_name, position, jersey_number, team_id, points, image"
      );

    if (playerError) throw playerError;

    // 🔵 3. Fetch all matches
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select(
        "match_id, match_date, home_team_id, away_team_id, home_score, away_score, location, season, completed"
      );

    if (matchError) throw matchError;

    // 🔗 4. Link players to their teams and compute total points
    const teamsWithPlayers = teams.map((team) => {
      const teamPlayers = players.filter((p) => p.team_id === team.team_id);
      const total_points = teamPlayers.reduce(
        (sum, p) => sum + (p.points || 0),
        0
      );
      return {
        ...team,
        total_points,
        players: teamPlayers,
      };
    });

    // 🔗 5. Link matches to actual team names
    const matchesWithTeams = matches.map((m) => {
      const homeTeam = teams.find((t) => t.team_id === m.home_team_id);
      const awayTeam = teams.find((t) => t.team_id === m.away_team_id);

      return {
        ...m,
        home_team_name: homeTeam?.team_name || "Unknown",
        away_team_name: awayTeam?.team_name || "Unknown",
      };
    });

    // 📦 6. Combine everything into one response
    const result = {
      teams: teamsWithPlayers,
      players,
      matches: matchesWithTeams,
      summary: {
        totalTeams: teams.length,
        totalPlayers: players.length,
        totalMatches: matches.length,
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/history:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
