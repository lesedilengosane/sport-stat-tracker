// app/api/DatabaseApi/createTeam/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { team_name, coach_id, icon_url } = body as { team_name: string; coach_id: string; icon_url?: string | null }

    if (!team_name || !coach_id) {
      return NextResponse.json({ error: "Missing required fields: team_name and coach_id" }, { status: 400 })
    }

    // 1. Check if team name already exists
    const { data: existingTeam, error: existingError } = await supabase
      .from("teams")
      .select("*")
      .eq("team_name", team_name)
      .maybeSingle()

    if (existingError) {
      console.error("Existing team check error:", existingError)
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    if (existingTeam) {
      return NextResponse.json({ error: "Team name already exists" }, { status: 400 })
    }

    // 2. Insert new team
    const teamId = uuidv4()
    const { data: newTeam, error: insertError } = await supabase
      .from("teams")
      .insert([{ team_id: teamId, team_name, coach_id, icon_url: icon_url || null }])
      .select()
      .maybeSingle()

    if (insertError) {
      console.error("Insert team error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    if (!newTeam) {
      return NextResponse.json({ error: "Team creation failed, no data returned" }, { status: 500 })
    }

    // 3. Ensure coach row exists and has correct team_id
    const { data: updatedCoach, error: coachError } = await supabase
      .from("coaches")
      .upsert(
        { user_id: coach_id, team_id: newTeam.team_id }, // 🔥 insert if not exists, update otherwise
        { onConflict: "user_id" },
      )
      .select()
      .maybeSingle()

    if (coachError) {
      console.error("Upsert coach error:", coachError)
      return NextResponse.json({ error: coachError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      team: newTeam,
      coach: updatedCoach,
    })
  } catch (err) {
    console.error("Unexpected error creating team:", err)
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
