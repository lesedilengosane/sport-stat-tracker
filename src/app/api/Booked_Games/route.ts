import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../DatabaseApi/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // pass role from frontend

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    let query = supabase
      .from('booked_matches')
      .select('id, created_at, basketball_history(*)');

    if (role === 'Analyst') {
      query = query.eq('user_id', userId);
    }
    // Admin can see all, so no filter applied

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
