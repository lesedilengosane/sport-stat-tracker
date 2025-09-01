import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_ALL_SPORTS_API_KEY;
const BASE_URL = "https://apiv2.allsportsapi.com/basketball/";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}?met=Leagues&APIkey=${API_KEY}`);
    if (!res.ok) throw new Error(`All Sports API error: ${res.status}`);

    const data = await res.json();
    const leagues = Array.isArray(data.result) ? data.result : [];
    return NextResponse.json({ result: leagues });
  } catch (error: any) {
    console.error("Leagues API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
