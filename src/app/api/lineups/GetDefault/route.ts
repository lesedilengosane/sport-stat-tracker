// app/api/lineups/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/DatabaseApi/supabaseClient';


export async function POST(req: Request) {
  try {
    const { auth_user_id } = await req.json()

    if (!auth_user_id) {
      return NextResponse.json(
        { error: 'auth_user_id is required ❌' },
        { status: 400 }
      )
    }

    // First, get the user_id from auth_user_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('auth_user_id', auth_user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found ❌' },
        { status: 404 }
      )
    }

    // Then get the coach's team
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('team_id')
      .eq('user_id', userData.user_id)
      .single()

    if (coachError || !coachData) {
      return NextResponse.json(
        { error: 'Coach not found ❌' },
        { status: 404 }
      )
    }

    // Get the default lineup with player names
    const { data: lineupData, error: lineupError } = await supabase
      .from('default_lineups')
      .select(`
        *,
        players!default_lineups_player_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('team_id', coachData.team_id)

    if (lineupError) {
      console.error('Database error:', lineupError)
      return NextResponse.json(
        { error: 'Database error ❌' },
        { status: 500 }
      )
    }

    if (!lineupData || lineupData.length === 0) {
      return NextResponse.json(
        { error: 'No default lineup found for this coach ❌' },
        { status: 404 }
      )
    }

    // Transform the data to include full player name
    const transformedLineup = lineupData.map(player => ({
      ...player,
      player_name: `${player.players?.first_name || ''} ${player.players?.last_name || ''}`.trim()
    }))

    return NextResponse.json({
      message: 'Default lineup retrieved ✅',
      lineup: transformedLineup,
    })

  } catch (err: any) {
    console.error('Server error:', err)
    return NextResponse.json(
      { error: 'Server error ❌' },
      { status: 500 }
    )
  }
}