import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch coach row
    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json(
        { success: false, error: "Coach not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        coach,
        team_id: coach.team_id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in /api/coach/check:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}