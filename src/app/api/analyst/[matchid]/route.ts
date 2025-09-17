

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
     const {data: teamids, error:matchError } = await supabase
    .from("matches")
    .select("away_team_id, home_team_id")
    .eq("match_id", matchid)
    .eq("completed", false)
    .single();
    const awayTeamId = teamids?.away_team_id;
    const homeTeamId = teamids?.home_team_id;

    if (matchError){
        return NextResponse.json({error:matchError.message},{status:500})
    }
    
    //The above works well and returns the team ids
    
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
        return NextResponse.json(lineups)



    //The previous games summary data 
    
} catch (err) {
    return NextResponse.json(
        {error : "failed to fetch TeamIds"},{ status :500}
    )
    
}

}