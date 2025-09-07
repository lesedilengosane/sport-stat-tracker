import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Make sure these are in your .env.local
// NEXT_PUBLIC_SUPABASE_URL=...
// SUPABASE_SERVICE_ROLE_KEY=...
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const team = searchParams.get('team');
    const team_home = searchParams.get('team_home');
    const team_away = searchParams.get('team_away');
    const league = searchParams.get('league');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // --- Build query ---
    let query = supabase
      .from('basketball_history') // ✅ Make sure this matches your table name
      .select('*', { count: 'exact' })
      .order('game_date', { ascending: false })
      .limit(limit);

    if (team) query = query.eq('team', team);
    if (team_home) query = query.eq('team_home', team_home);
    if (team_away) query = query.eq('team_away', team_away);
    if (league) query = query.eq('league', league);
    if (startDate) query = query.gte('game_date', startDate);
    if (endDate) query = query.lte('game_date', endDate);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Supabase query failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, total: count });
  } catch (err: any) {
    console.error('❌ API crashed:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
