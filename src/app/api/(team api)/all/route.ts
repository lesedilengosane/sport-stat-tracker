import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../DatabaseApi/supabaseClient";

export async function GET() {
  try {
    // Fetch Coaches with their related Users and Teams
    const { data: coaches, error: coachError } = await supabase
      .from("coaches")
      .select(
        `
        coach_id,
        team_id,
        user_id,
        users:user_id (
          user_id,
          first_name,
          last_name,
          role
        ),
        teams:team_id (
          team_id,
          team_name,
          icon_url,
          created_at
        )
      `
      );

    if (coachError) throw coachError;

    // Fetch Matches with Team Names + Analyst Info
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select(
        `
        match_id,
        home_team_id,
        away_team_id,
        match_date,
        location,
        season,
        completed,
        home_score,
        away_score,
        booked,
        analyst,
        home_team:home_team_id (
          team_id,
          team_name,
          icon_url
        ),
        away_team:away_team_id (
          team_id,
          team_name,
          icon_url
        ),
        analyst_user:analyst (
          auth_user_id,
          first_name,
          last_name,
          role
        )
      `
      );

    if (matchError) throw matchError;

    // Fetch All Teams with Coaches
    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select(
        `
        team_id,
        team_name,
        created_at,
        icon_url,
        lineup,
        coach:coach_id (
          user_id,
          first_name,
          last_name,
          role
        )
      `
      );

    if (teamError) throw teamError;

    // Fetch All Users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*");

    if (userError) throw userError;

    return NextResponse.json({
      coaches,
      matches,
      teams,
      users,
    });
  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch data", details: err.message },
      { status: 500 }
    );
  }
}