// app/api/fan-dashboard/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

export async function GET() {
  // Call your RPC
  const { data, error } = await supabase.rpc("get_fan_dashboard");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Your RPC returns a single JSON object, so just return it directly
  return NextResponse.json(data);
}
