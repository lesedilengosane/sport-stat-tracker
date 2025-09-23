// app/api/lineups/update/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"

export async function POST(req: Request) {
  try {
    const { startingLineup, reserves } = await req.json()

    if (!startingLineup || !reserves) {
      return NextResponse.json(
        { error: "Both startingLineup and reserves are required ❌" },
        { status: 400 }
      )
    }

    // Combine startingLineup and reserves to get all players
    const allPlayers = [...startingLineup, ...reserves]

    // Only pick player_id and is_starting to update
    for (const player of allPlayers) {
      const { playerID, isStarting } = player

      const { error } = await supabase
        .from("default_lineups")
        .update({ is_starting: isStarting })
        .eq("player_id", playerID)

      if (error) {
        return NextResponse.json(
          { error: `Failed to update player ${playerID}: ${error.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: "Default lineup updated successfully ✅",
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Server error ❌" },
      { status: 500 }
    )
  }
}
