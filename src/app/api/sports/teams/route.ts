import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_ALL_SPORTS_API_KEY;
const BASE_URL = "https://apiv2.allsportsapi.com/basketball/";

interface Team {
  team_key: string;
  team_name: string;
  league_key: string;
  team_logo?: string;
}

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get("league_id") || "";
  try {
    const url = leagueId
      ? `${BASE_URL}?met=Teams&leagueId=${leagueId}&APIkey=${API_KEY}`
      : `${BASE_URL}?met=Teams&APIkey=${API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`All Sports API error: ${res.status}`);

    const data = await res.json();
    const teams: Team[] = Array.isArray(data.result) ? data.result : [];
    return NextResponse.json({ result: teams });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Teams API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
