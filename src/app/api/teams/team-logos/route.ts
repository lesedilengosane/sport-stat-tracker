// app/api/teams/team-logos/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

const ESPN_API_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

// List of placeholder values that indicate no real logo
const PLACEHOLDER_LOGOS = ["EMPTY", "/default_team.svg", "NULL", null, ""];

// Function to normalize team names for better matching
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

// Mapping of database team names to ESPN API team names
const TEAM_NAME_MAPPINGS: { [key: string]: string } = {
  "los angeles lakers": "Lakers",
  "atlanta hawks": "Hawks",
  "boston celtics": "Celtics",
  "brooklyn nets": "Nets",
  "charlotte hornets": "Hornets",
  "chicago bulls": "Bulls",
  "cleveland cavaliers": "Cavaliers",
  "dallas mavericks": "Mavericks",
  "denver nuggets": "Nuggets",
  "detroit pistons": "Pistons",
  "golden state warriors": "Warriors",
  "houston rockets": "Rockets",
  "indiana pacers": "Pacers",
  "la clippers": "Clippers",
  "memphis grizzlies": "Grizzlies",
  "miami heat": "Heat",
  "milwaukee bucks": "Bucks",
  "minnesota timberwolves": "Timberwolves",
  "new orleans pelicans": "Pelicans",
  "new york knicks": "Knicks",
  "oklahoma city thunder": "Thunder",
  "orlando magic": "Magic",
  "philadelphia 76ers": "76ers",
  "phoenix suns": "Suns",
  "portland trail blazers": "Trail Blazers",
  "sacramento kings": "Kings",
  "san antonio spurs": "Spurs",
  "toronto raptors": "Raptors",
  "utah jazz": "Jazz",
  "washington wizards": "Wizards"
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    // 1) Fetch team from Supabase
    console.log("Fetching team from Supabase:", teamId);
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("team_id, team_name, icon_url")
      .eq("team_id", teamId)
      .single();

    if (teamError || !team) {
      console.error("Supabase team fetch error:", teamError);
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if icon_url is a placeholder or already a valid URL
    const currentIconUrl = team.icon_url;
    if (currentIconUrl && 
        !PLACEHOLDER_LOGOS.includes(currentIconUrl) && 
        typeof currentIconUrl === "string" && 
        currentIconUrl.startsWith("http")) {
      console.log("Team already has valid icon_url:", currentIconUrl);
      return NextResponse.json({ logoUrl: currentIconUrl });
    }

    console.log("Fetching logo for team:", team.team_name);

    // 2) Fetch teams from ESPN API
    console.log("Fetching teams from ESPN API");
    const espnRes = await fetch(ESPN_API_URL);
    if (!espnRes.ok) {
      const text = await espnRes.text().catch(() => "");
      throw new Error(`ESPN API error: ${espnRes.status} ${espnRes.statusText} ${text}`);
    }
    
    const espnPayload = await espnRes.json();
    
    // Extract teams from the ESPN API response
    let teams = [];
    if (espnPayload.sports && espnPayload.sports[0] && espnPayload.sports[0].leagues) {
      for (const league of espnPayload.sports[0].leagues) {
        if (league.teams) {
          teams = league.teams.map((teamObj: any) => teamObj.team);
        }
      }
    }
    
    console.log(`Found ${teams.length} teams in ESPN API response`);

    // 3) Find the team in the API response
    const normalizedTarget = normalizeTeamName(team.team_name || "");
    console.log("Normalized target name:", normalizedTarget);
    
    // Try to find the ESPN team name using our mapping
    const espnTeamName = TEAM_NAME_MAPPINGS[normalizedTarget];
    let matchedTeam = null;
    
    if (espnTeamName) {
      // Search for the team using the mapped name
      matchedTeam = teams.find((t: any) => 
        t.displayName === espnTeamName || 
        t.name === espnTeamName || 
        t.shortDisplayName === espnTeamName
      );
    }
    
    // If no match found with mapping, try to find by name similarity
    if (!matchedTeam) {
      matchedTeam = teams.find((t: any) => {
        const normalizedApiName = normalizeTeamName(t.displayName || t.name || "");
        return normalizedApiName.includes(normalizedTarget) || 
               normalizedTarget.includes(normalizedApiName);
      });
    }

    if (!matchedTeam) {
      console.error("No team match found in ESPN API for:", team.team_name);
      return NextResponse.json({ error: "No team found in ESPN API" }, { status: 404 });
    }

    console.log("Matched team:", matchedTeam.displayName);

    // 4) Get the logo URL from the matched team
    let logoUrl = null;
    if (matchedTeam.logos && matchedTeam.logos.length > 0) {
      logoUrl = matchedTeam.logos[0].href;
    }

    if (!logoUrl) {
      console.error("Matched team has no logo:", matchedTeam);
      return NextResponse.json({ error: "No logo found for the matched team" }, { status: 404 });
    }

    console.log("Found logo URL:", logoUrl);

    // 5) Download image
    const imageRes = await fetch(logoUrl);
    if (!imageRes.ok) {
      const txt = await imageRes.text().catch(() => "");
      throw new Error(`Failed to download logo: ${imageRes.status} ${imageRes.statusText} ${txt}`);
    }
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const extension = contentType.split("/")[1]?.split(";")[0] || "png";
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6) Upload to Supabase storage (bucket: teamLogos)
    const filePath = `${teamId}.${extension}`;
    console.log("Uploading to Supabase storage:", filePath);
    const { error: uploadError } = await supabase.storage
      .from("teamLogos")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }

    // 7) Get public URL
    const publicUrlResult = supabase.storage.from("teamLogos").getPublicUrl(filePath);
    const publicUrl = publicUrlResult?.data?.publicUrl;

    if (!publicUrl) {
      console.error("No public URL returned:", publicUrlResult);
      throw new Error("Failed to obtain public URL after upload");
    }

    // 8) Update Supabase teams table
    const { error: updateError } = await supabase
      .from("teams")
      .update({ icon_url: publicUrl })
      .eq("team_id", teamId);

    if (updateError) {
      console.error("Supabase teams table update error:", updateError);
      return NextResponse.json(
        { logoUrl: publicUrl, warning: "Uploaded but failed to update DB" },
        { status: 200 }
      );
    }

    // 9) Return the public URL
    return NextResponse.json({ logoUrl: publicUrl });
  } catch (err: any) {
    console.error("team-logos route error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch team logo" }, { status: 500 });
  }
}