

//This is where we fetch all details pertaining a specific game using the match id

import { NextResponse } from "next/server";
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';
//Given the MatchID we should be able to fetch all lineups and playerid
export async function GET(request:Request,{params}:{
    params:{
        matchid:string
    }
})
{
    const {matchid}=await params
    
try {
    //we need to fetch all both teamids then fetch all the default lineups or lineups set
     // 1. Fetch match object
    const { data: matchMetaData, error: errorMatch } = await supabase
      .from("matches")
      .select("*") // include all match fields (date, score, status, etc.)
      .eq("match_id", matchid)
      .single();

    if (errorMatch) {
      return NextResponse.json({ error: errorMatch.message }, { status: 500 });
    }

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
        return NextResponse.json({error :teamsError.message},{status:500})
    }
    
    //Lineups are the team_players
    // 2. Fetch lineups for both teams in the match
    const { data: lineups, error: lineupError } = await supabase
    .from("lineups")
  .select(`
    lineup_id,
    match_id,
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
  .eq("match_id", matchid)
  .in("team_id", [awayTeamId, homeTeamId]);

    if (lineupError) {
         return NextResponse.json({error :lineupError.message},{status :500})
        }

/**
 * This is optional for splitting Your lineups
 const awayLineup = lineups.filter((l) => l.teamid === away_team_id);
const homeLineup = lineups.filter((l) => l.teamid === home_team_id);
 */

//The above for fetching lineups works well
//3 last 5 matches for home team
    const { data: homePrevMatches, error: homeError } = await supabase
    .from("matches")
    .select("*")
    .or(`home_team_id.eq.${homeTeamId},away_team_id.eq.${awayTeamId}`)
    .eq("completed", true)
    .order("match_date", { ascending: false })
    .limit(5);

    if(homeError){
        return NextResponse.json({error:homeError.message},{status:500})
    }

// last 5 matches for away team
    const { data: awayPrevMatches, error: awayError } = await supabase
    .from("matches")
    .select("*")
    .or(`home_team_id.eq.${homeTeamId},away_team_id.eq.${awayTeamId}`)
    .eq("completed", true)
    .order("match_date", { ascending: false })
    .limit(5);

    if (awayError){
        return NextResponse.json({error:awayError.message},{status:500})
    }
//Now we need to combine the two Jsons
 return NextResponse.json({
    matchMetaData,
    Teams,
    lineups,
    awayPrevMatches,
    homePrevMatches
 })

        

} catch (err) {
    return NextResponse.json(
        {error : "failed to fetch TeamIds"},{ status :500}
    )
    
}

}