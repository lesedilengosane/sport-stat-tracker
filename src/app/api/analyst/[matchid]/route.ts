

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
     const {data: teamids, error } = await supabase
    .from("matches")
    .select("away_team_id, home_team_id")
    .eq("match_id", matchid)
    .eq("completed", false)
    .single();
    const awayTeamId = teamids?.away_team_id;
    const homeTeamId = teamids?.home_team_id;

    if (error){
        return NextResponse.json({error: error.message},{status:500})
    }

    return NextResponse.json(teamids);
    //Lineups are the team_players
    //The previous games summary data 
    
} catch (err) {
    return NextResponse.json(
        {error : "failed to fetch TeamIds"},{ status :500}
    )
    
}

}