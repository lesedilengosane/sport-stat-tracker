// app/api/coach/release-player/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    // 1️⃣ Set team_id = null in players table
    const { error: updateError } = await supabase
      .from("players")
      .update({ team_id: null })
      .eq("player_id", playerId);

    if (updateError) {
      console.error("Error updating player:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2️⃣ Delete from default_lineups table
    const { error: deleteError } = await supabase
      .from("default_lineups")
      .delete()
      .eq("player_id", playerId);

    if (deleteError) {
      console.error("Error deleting from default_lineups:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Player released successfully" });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
