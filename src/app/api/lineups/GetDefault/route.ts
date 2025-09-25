// app/api/lineups/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/DatabaseApi/supabaseClient'

export async function POST(req: Request) {
  const startTime = Date.now()
  console.log('🚀 Starting default lineup request...')
  
  try {
    const requestBody = await req.text()
    
    const { auth_user_id } = JSON.parse(requestBody)

    if (!auth_user_id) {
      console.log('❌ Missing auth_user_id')
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

    if (userError) {
      console.log('❌ User lookup error:', userError)
      return NextResponse.json(
        { error: `User lookup failed: ${userError.message} ❌` },
        { status: 404 }
      )
    }

    if (!userData) {
      console.log('❌ User not found for auth_user_id:', auth_user_id)
      return NextResponse.json(
        { error: 'User not found ❌' },
        { status: 404 }
      )
    }

    console.log('✅ Found user with user_id:', userData.user_id)

    // Then get the coach's team
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('team_id')
      .eq('user_id', userData.user_id)
      .single()

    if (coachError) {
      console.log('❌ Coach lookup error:', coachError)
      return NextResponse.json(
        { error: `Coach lookup failed: ${coachError.message} ❌` },
        { status: 404 }
      )
    }

    if (!coachData) {
      console.log('❌ Coach not found for user_id:', userData.user_id)
      return NextResponse.json(
        { error: 'Coach not found ❌' },
        { status: 404 }
      )
    }

    console.log('✅ Found coach with team_id:', coachData.team_id)

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
      console.log('❌ Database lineup query error:', lineupError)
      return NextResponse.json(
        { error: `Database error: ${lineupError.message} ❌` },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${lineupData?.length || 0} lineup entries`)

    if (!lineupData || lineupData.length === 0) {
      console.warn('⚠️ No default lineup found for team_id:', coachData.team_id)
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

    const duration = Date.now() - startTime
    console.log(`✅ Successfully retrieved lineup in ${duration}ms`)

    return NextResponse.json({
      message: 'Default lineup retrieved ✅',
      lineup: transformedLineup,
    })

  } catch (err: any) {
    const duration = Date.now() - startTime
    console.log('🔥 Server error after', duration, 'ms:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    })
    
    return NextResponse.json(
      { error: `Server error: ${err.message} ❌` },
      { status: 500 }
    )
  }
}