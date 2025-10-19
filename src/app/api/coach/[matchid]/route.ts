

//This is where we fetch all details pertaining a specific game using the match id

import { NextResponse } from "next/server";
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';
//Given the MatchID we should be able to fetch all lineups and playerid
export async function GET(request:Request,{
  params,
}: {
  params: Promise<{ matchid: string }>;
})
{
    const {matchid}=await params
    
try {
    //we need to fetch all both teamids then fetch all the default lineups or lineups set
    console.log(`The matchid received in the backend from the API is : ${matchid}`)
     // 1. Fetch match object
    const { data: matchMetaData, error: errorMatch } = await supabase
      .from("matches")
      .select("*") // include all match fields (date, score, status, etc.)
      .eq("match_id", matchid)
      .single();

    if (errorMatch) {
      console.log(`There was an error perfoming the 1st fetch`)
      return NextResponse.json({ error: errorMatch.message }, { status: 500 });
    }
console.log(`The 1st fetch has been perfomed\n The match metaData is : ${matchMetaData}`)
    const awayTeamId = matchMetaData.away_team_id;
    const homeTeamId = matchMetaData.home_team_id;
    
    //The above works well and returns the team ids
    const {data:Teams,error:teamsError}=await supabase
    .from("teams")
    .select(
        `team_id,
        team_name,
        coach_id,
        icon_url`
    )
    .in("team_id",[awayTeamId,homeTeamId])

    if(teamsError){
      console.log(`There was an error perfoming the second fetch`)
        return NextResponse.json({error :teamsError.message},{status:500})
    }
    console.log(`The second fetch was perfomed well,the team details for both were fetched`)
    //Lineups are the team_players
    // 2. Fetch lineups for both teams in the match
   const { data: defaultLineups, error: lineupError } = await supabase
  .from("default_lineups")
  .select(`
    default_lineup_id,
    team_id,
    player_id,
    position,
    is_starting,
    jersey_number,
    player:players (
      first_name,
      last_name,
      player_id,
      team_id
    )
  `)
  .in("team_id", [awayTeamId, homeTeamId]);  // only filter by team_id


    if (lineupError) {
      console.log(`There was an error fetching default lineups for the teams`)
         return NextResponse.json({error :lineupError.message},{status :500})
        }
console.log(`The 3td fetch was perfomed well`)


const homeLineup = defaultLineups.filter(l => l.team_id === homeTeamId);
const awayLineup = defaultLineups.filter(l => l.team_id === awayTeamId);
const Lineups={homeLineup,awayLineup}
 

//The above for fetching lineups works well
// last 5 matches for home team
const { data: homePrevMatches, error: homeError } = await supabase
  .from("matches")
  .select(`
    match_id,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    match_date,
    completed,
    home_team:home_team_id (
      team_id,
      team_name,
      icon_url,
      coach_id
    ),
    away_team:away_team_id (
      team_id,
      team_name,
      icon_url,
      coach_id
    )
  `)
  .or(`home_team_id.eq.${homeTeamId},away_team_id.eq.${homeTeamId}`)
  .eq("completed", true)
  .order("match_date", { ascending: false })
  .limit(5);

if (homeError) {
  console.log("There was an error fetching prev matches for Home team");
  return NextResponse.json({ error: homeError.message }, { status: 500 });
}

console.log("✅ The 4th fetch was performed well");


// last 5 matches for away team
const { data: awayPrevMatches, error: awayError } = await supabase
  .from("matches")
  .select(`
    match_id,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    match_date,
    completed,
    home_team:home_team_id (
      team_id,
      team_name,
      icon_url,
      coach_id
    ),
    away_team:away_team_id (
      team_id,
      team_name,
      icon_url,
      coach_id
    )
  `)
  .or(`home_team_id.eq.${awayTeamId},away_team_id.eq.${awayTeamId}`)
  .eq("completed", true)
  .order("match_date", { ascending: false })
  .limit(5);

if (awayError) {
  console.log("There was an error fetching prev matches for Away team");
  return NextResponse.json({ error: awayError.message }, { status: 500 });
}

console.log("✅ The 5th fetch was performed well");

// 2. Fetch events for this match with player info
const { data: MatchEvents, error: eventsError } = await supabase
  .from("match_events")
  .select(`
    id,
    match_id,
    timestamp,
    team_id,
    action,
    points,
    player_id,
    players (
      player_id,
      first_name,
      last_name,
      position,
      jersey_number,
      team_id
    )
  `)
  .eq("match_id", matchid)
  .order("timestamp", { ascending: true });

  if(eventsError){
    console.log(`There was an error fetching game events`)
    return NextResponse.json({error :eventsError.message},{status:500})
  }
//Now we need to combine the two Jsons
 return NextResponse.json({
    matchMetaData,
    Teams,
    lineups: Lineups,
    awayPrevMatches,
    homePrevMatches,
     MatchEvents
 })

        

} catch (err) {
    return NextResponse.json(
        {error : "failed to fetch TeamIds"},{ status :500}
    )
    
}

}