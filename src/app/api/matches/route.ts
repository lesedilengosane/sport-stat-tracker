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
//This route will receive a huge json body and update player_stats,match_stats and match_events


export async function POST(request: Request) {

  //example json body
  /**
   const game_data_example={
  "date": "September 6, 2025",
  "match_id":"id"
  "homeTeam": {
    "teamid": "Lakers-teamID",
    "name": "Los Angeles Lakers",
    "score": 18,
    "players": [
      {
        "id": "lakers-1",
        "name": "LeBron James",
        "position": "SF",
        "jerseyNumber": 6,
        "stats": {
          "playerId": "lakers-1",
          "points": 0,
          "assists": 0,
          "rebounds": 1
        }
      },
      {
        "id": "lakers-2",
        "name": "Anthony Davis",
        "position": "PF",
        "jerseyNumber": 3,
        "stats": {
          "playerId": "lakers-2",
          "points": 0,
          "assists": 0,
          "rebounds": 0
        }
      },
      {
        "id": "lakers-3",
        "name": "Russell Westbrook",
        "position": "PG",
        "jerseyNumber": 0,
        "stats": {
          "playerId": "lakers-3",
          "points": 18,
          "assists": 1,
          "rebounds": 0
        }
      }
    ]
  },
  "awayTeam": {
    "teamid":"Warrior-teamID",
    "name": "Golden State Warriors",
    "score": 26,
    "players": [
      {
        "id": "warriors-1",
        "name": "Stephen Curry",
        "position": "PG",
        "jerseyNumber": 30,
        "stats": {
          "playerId": "warriors-1",
          "points": 21,
          "assists": 0,
          "rebounds": 0
        }
      },
      {
        "id": "warriors-2",
        "name": "Klay Thompson",
        "position": "SG",
        "jerseyNumber": 11,
        "stats": {
          "playerId": "warriors-2",
          "points": 5,
          "assists": 3,
          "rebounds": 2
        }
      },
      {
        "id": "warriors-3",
        "name": "Andrew Wiggins",
        "position": "SF",
        "jerseyNumber": 22,
        "stats": {
          "playerId": "warriors-3",
          "points": 0,
          "assists": 0,
          "rebounds": 0
        }
      }
    ]
  },
  "events": [
    {
      "match_id": "1757189272875",
      "timestamp": "22:07:52",
      "teamId": "away",
      "playerId": "warriors-2",
      "playerName": "Klay Thompson",
      "action": "Foul",
      "points": 0
    },
    {
      "match_id": "1757189235656",
      "timestamp": "22:07:15",
      "teamId": "away",
      "playerId": "warriors-3",
      "playerName": "Andrew Wiggins",
      "action": "Stl",
      "points": 0
    },
    {
      "match_id": "1757189232100",
      "timestamp": "22:07:12",
      "teamId": "home",
      "playerId": "lakers-4",
      "playerName": "Austin Reaves",
      "action": "Blk",
      "points": 0
    }
  ],
  "finalScore": "18-26"
}
   */
  try {
    const body = await request.json();

   
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
    const { data: match } = await supabase
      .from('matches')
      .insert(match_record)
      .select()
      .single()

    //update all the match events so that they can be used for match summary
    const match_events=body.events;
    const {data :insertedevents}=await supabase
    .from('match_events')
    .insert(match_events)
    .select()

    //The match events are successfully updated along with matches table

    

    //Now we wanna update player stats
    //home team
    const home_team_stats=body.homeTeam.players.map((p: { stats: any; }) =>p.stats);
    const away_team_stats=body.awayTeam.players.map((p: { stats: any; }) =>p.stats);
    const {data :matchStats}=await supabase
    .from('player_stats')
    .insert(home_team_stats)
    .select()

    //away team
    const {data :matchStats2}=await supabase
    .from('player_stats')
    .insert(away_team_stats)
    .select()

    //The stats per player in a match are updated successfully
    
    //we wanna update all time statistics now

    //we define something called a RPC which is a Postgres function that takes in a json and perfoms operations with it
    //it uses our json to update all time player stats

    const { data, error } = await supabase.rpc("bulk_update_player_stats", {
      p_stats: home_team_stats
      });

    const { data:away_team} = await supabase.rpc("bulk_update_player_stats", {
  p_stats: away_team_stats});

      //at this point all data has been successfully updated
    if (error) {
      return NextResponse.json({ error: `Match stats for players failed to insert or server error : ${error.message}`},{ status: 500 });
    }


    return NextResponse.json(matchStats2);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}