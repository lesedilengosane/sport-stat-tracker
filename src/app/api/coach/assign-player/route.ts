import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

import { NextRequest, NextResponse } from "next/server";


export interface AssignPlayerData {
  playerId: string;
  teamId: string;
}

/**
 * Assigns a player to a team by updating the player's team_id
 * @param data - Object containing playerId and teamId
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */

async function assignPlayer({ playerId, teamId }: AssignPlayerData) {
  try {
    const { data: existingPlayer, error: queryError } = await supabase
      .from("players")
      .select("player_id, team_id")
      .eq("player_id", playerId)
      .maybeSingle();

    if (queryError) throw new Error("Failed to fetch player");
    if (!existingPlayer) return { success: false, error: "Player not found" };
    if (existingPlayer.team_id)
      return { success: false, error: "Player is already assigned to a team" };

    const { data, error: updateError } = await supabase
      .from("players")
      .update({ team_id: teamId })
      .eq("player_id", playerId)
      .select();

    if (updateError) throw updateError;

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Unexpected error in assignPlayer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


export async function POST(req: NextRequest) {
  try {
    const body: AssignPlayerData = await req.json();
    const result = await assignPlayer(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Error in /assign-player API:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
