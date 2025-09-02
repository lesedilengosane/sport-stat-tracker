import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_ALL_SPORTS_API_KEY;
const BASE_URL = "https://apiv2.allsportsapi.com/basketball/";

interface League {
  league_key: string;
  league_name: string;
  country_name: string;
}

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}?met=Leagues&APIkey=${API_KEY}`);
    if (!res.ok) throw new Error(`All Sports API error: ${res.status}`);

    const data = await res.json();
    const leagues: League[] = Array.isArray(data.result) ? data.result : [];
    return NextResponse.json({ result: leagues });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Leagues API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
