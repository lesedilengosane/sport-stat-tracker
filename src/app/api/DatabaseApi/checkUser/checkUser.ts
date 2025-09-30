import { supabase } from "../supabaseClient";

export async function checkUser(
  identifier: string,
  by: 'auth_user_id' | 'email' = 'auth_user_id'
): Promise<{
  exists: boolean;
  role?: string;
  first_name?: string;
  last_name?: string;
  user_id?: string;
  auth_user_id?:string;
  hasTeam?: boolean;
  error?: string;
}> {
  try {
    if (!identifier) {
      return { exists: false, error: 'Identifier is required' };
    }

    // 🔹 Step 1: Get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq(by, identifier)
      .maybeSingle();

    if (userError) {
      console.error(`Error checking user by ${by}:`, userError);
      return { exists: false, error: `Database error: ${userError.message}` };
    }

    if (!userData) {
      return {
        exists: false,
        user_id: undefined,
        role: undefined,
        first_name: undefined,
        last_name: undefined,
        auth_user_id:undefined,
        hasTeam: undefined,
      };
    }

    let hasTeam: boolean | undefined = undefined;

    // 🔹 Step 2: If user is a coach, check coaches table for team_id
    if (userData.role === 'Coach') {
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('team_id')
        .eq('user_id', userData.user_id)
        .maybeSingle();

      if (coachError) {
        console.error('Error checking coach team:', coachError);
      }

      // If team_id exists & not null → hasTeam = true
      hasTeam = coachData?.team_id ? true : false;
    }

    return {
      exists: true,
      user_id: userData.user_id,
      role: userData.role,
      first_name: userData.first_name,
      last_name: userData.last_name,
      auth_user_id:userData.auth_user_id,
      hasTeam, 
    };
  } catch (error) {
    console.error('Unexpected error in checkUser:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
