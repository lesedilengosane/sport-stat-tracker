// app/api/matches/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(matches);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}


//we use RPC to perfom all the heavy duty of this request

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Incoming match payload:", body);

    // Call the bulk_save_game RPC
    const { data, error } = await supabase.rpc("bulk_save_game", { p_game: body });

    if (error) {
      console.error("❌ RPC failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("❌ POST /api/matches failed:", err);
    return NextResponse.json({ error: "Failed to save game data" }, { status: 500 });
  }
}


  
 



  /**
    try {
    
    const body = await request.json();
    console.log("Incoming match payload:", body);
   
    const match_record={
      match_id:body.match_id,
      home_team_id:body.homeTeam.team_id,
      away_team_id:body.awayTeam.team_id,
      match_date:body.date,
      completed:true,
      season:body.season,
      //location:body.location, The location is there in the DB I do not need it
      home_score:body.homeTeam.score,
      away_score:body.awayTeam.score
    }
    //Update match details,This works well
    const { data: match,error:Error_details } = await supabase
      .from('matches')
      .insert(match_record)
      .select()
      .single()

      if(Error_details){
        return NextResponse.json({error:`Could not post match details in the database : ${Error_details.message}`},{status:500})
      }

    //update all the match events so that they can be used for match summary
    const match_events=body.events;
    const {data :insertedevents,error:Error_events}=await supabase
    .from('match_events')
    .insert(match_events)
    .select()


    if(Error_events){
      return NextResponse.json({error:`Error updating match events in the DB : ${Error_events.message}`},{status:500})
    }
    //The match events are successfully updated along with matches table

    

    //Now we wanna update player stats
    //home team
    const home_team_stats=body.homeTeam.players.map((p: { stats: any; }) =>p.stats);
    const away_team_stats=body.awayTeam.players.map((p: { stats: any; }) =>p.stats);
    const {data :matchStats,error:Error_matchStats_home}=await supabase
    .from('player_stats')
    .insert(home_team_stats)
    .select()

    if(Error_matchStats_home){
      return NextResponse.json({error:`Could not update Home player Stats in the DB : ${Error_matchStats_home.message}`},{status:500})
    }
    //away team
    const {data :matchStats2,error:Error_matchStats_away}=await supabase
    .from('player_stats')
    .insert(away_team_stats)
    .select()

    if(Error_matchStats_away){
      return NextResponse.json({error:`Could not update Away player Stats in the DB : ${Error_matchStats_away.message}`},{status:500})
    }

    //The stats per player in a match are updated successfully
    
    //we wanna update all time statistics now

    //we define something called a RPC which is a Postgres function that takes in a json and perfoms operations with it
    //it uses our json to update all time player stats

    const { data, error:Error_alltime_stats1 } = await supabase.rpc("bulk_update_player_stats", {
      p_stats: home_team_stats
      });

      if(Error_alltime_stats1){
        return NextResponse.json({error:`Could not update Home team all time player stats in the DB : ${Error_alltime_stats1.message}`},{status:500})
      }
    const { data:away_team,error:Error_alltime_stats2} = await supabase.rpc("bulk_update_player_stats", {
  p_stats: away_team_stats});

      //at this point all data has been successfully updated
    if(Error_alltime_stats2){
        return NextResponse.json({error:`Could not update Away team all time player stats in the DB : ${Error_alltime_stats2.message}`},{status:500})
      }

    return NextResponse.json({ success: true /*, result  }, { status: 200 })
  } catch (err) {

    console.error("❌ Error in POST /api/matches:", err);
    return NextResponse.json(
      { error: 'Failed to Save game data ' },
      { status: 500 }
    );
  }
   */