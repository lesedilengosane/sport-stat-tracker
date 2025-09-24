// app/api/players/unassigned/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../DatabaseApi/supabaseClient";

export async function GET() {
  try {
    // Fetch all players with null team_id
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .is("team_id", null);

    if (error) {
      console.error("Error fetching unassigned players:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
