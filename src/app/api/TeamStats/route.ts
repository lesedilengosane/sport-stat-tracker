
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auth_user_id, team_id } = body;

    if (!auth_user_id && !team_id) {
      return NextResponse.json(
        { error: "You must provide either auth_user_id or team_id in the body" },
        { status: 400 }
      );
    }

    let statsData;

    if (auth_user_id) {
      // Call RPC by auth_user_id
      const { data, error } = await supabase.rpc("get_team_full_stats_by_user", {
        p_auth_user_id: auth_user_id,
      });

      if (error) {
        console.error("Error fetching team stats by user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      statsData = data;
    } else if (team_id) {
      // Call RPC by team_id
      const { data, error } = await supabase.rpc("get_team_full_stats", {
        p_team_id: team_id,
      });

      if (error) {
        console.error("Error fetching team stats by team_id:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      statsData = data;
    }

    if (!statsData || statsData.length === 0) {
      return NextResponse.json({ error: "No stats found for this team" }, { status: 404 });
    }

    const result = {
      team_name: statsData[0].team_name,
      num_players: statsData[0].num_players,
      last_5_matches: statsData[0].last_5_matches,
      player_stats: statsData[0].player_stats,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error in /team/stats route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
