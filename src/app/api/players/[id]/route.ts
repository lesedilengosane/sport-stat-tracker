// app/api/players/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../DatabaseApi/supabaseClient";

export async function GET(request: Request) {
  try {
    // Extract the player id from the pathname
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/"); // ['', 'api', 'players', 'playerId']
    const id = pathSegments[pathSegments.length - 1];

    const { data: player, error } = await supabase
      .from("players")
      .select("*")
      .eq("player_id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (err) {
    console.error("Internal server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
