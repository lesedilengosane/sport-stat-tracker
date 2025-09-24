// app/api/lineups/update/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

export async function POST(req: Request) {
  try {
    const { startingLineup, reserves } = await req.json();

    if (!startingLineup || !reserves) {
      return NextResponse.json(
        { error: "Both startingLineup and reserves are required ❌" },
        { status: 400 }
      );
    }

    // --- 1️⃣ Ensure no duplicate positions among starters ---
    const positions = new Set<string>();
    for (const player of startingLineup) {
      if (positions.has(player.position)) {
        return NextResponse.json(
          { error: `Duplicate starting position detected: ${player.position} ❌` },
          { status: 400 }
        );
      }
      positions.add(player.position);
    }

    // --- 2️⃣ Ensure max 5 starters ---
    if (startingLineup.length > 5) {
      return NextResponse.json(
        { error: "Cannot have more than 5 starting players ❌" },
        { status: 400 }
      );
    }

    // --- 3️⃣ Combine all players for update ---
    const allPlayers = [...startingLineup, ...reserves];

    // --- 4️⃣ Update each player ---
    for (const player of allPlayers) {
      const { playerID, teamID, isStarting, position } = player;

      const { error } = await supabase
        .from("default_lineups")
        .update({
          is_starting: isStarting,
          position: position,
        })
        .eq("player_id", playerID)
        .eq("team_id", teamID); // extra safety filter

      if (error) {
        console.error(`Failed to update player ${playerID}:`, error);
        return NextResponse.json(
          { error: `Failed to update player ${playerID}: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Default lineup updated successfully ✅",
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: err.message || "Server error ❌" },
      { status: 500 }
    );
  }
}
