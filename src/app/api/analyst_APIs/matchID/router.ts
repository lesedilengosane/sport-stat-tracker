

//This is where we fetch all details pertaining a specific game using the match id

import { NextResponse } from "next/server";

export function GET(request:Request,{params}:{
    params:{
        matchid:string
    }
})
{

    const match_id=params.matchid;

try {

    //we need to fetch all both teamids then fetch all the default lineups or lineups set
    //Lineups are the team_players
    //The previous games summary data 
    
} catch (error) {
    
}

}