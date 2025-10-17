import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "../DatabaseApi/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ players: [], teams: [] })
    }

    const searchTerm = query.trim()

    console.log("[v0] Search query:", searchTerm)

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("player_id, first_name, last_name, position, jersey_number, team_id")
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(10)

    if (playersError) {
      console.error("[v0] Players search error:", playersError)
    } else {
      console.log("[v0] Players found:", players?.length || 0)
    }

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("team_id, team_name, icon_url")
      .ilike("team_name", `%${searchTerm}%`)
      .limit(10)

    if (teamsError) {
      console.error("[v0] Teams search error:", teamsError)
    } else {
      console.log("[v0] Teams found:", teams?.length || 0)
    }

    return NextResponse.json({
      players: players || [],
      teams: teams || [],
    })
  } catch (error) {
    console.error("[v0] Search API error:", error)
    return NextResponse.json({ error: "Internal server error", players: [], teams: [] }, { status: 500 })
  }
}
