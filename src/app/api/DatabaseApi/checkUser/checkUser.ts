import { supabase } from "../supabaseClient";

/**
 * Checks if a user exists in the database
 * @param identifier - Can be either auth_user_id or email
 * @param by - Field to check by ('auth_user_id' or 'email')
 * @returns Promise<{ exists: boolean, error?: string }>
 */
export async function checkUser(
  identifier: string,
  by: 'auth_user_id' | 'email' = 'auth_user_id'
): Promise<{ exists: boolean, error?: string }> {
  try {
    // Validate input
    if (!identifier) {
      return {
        exists: false,
        error: 'Identifier is required'
      };
    }

    // Query the database
    const { data, error } = await supabase
      .from('users')
      .select(by)
      .eq(by, identifier)
      .maybeSingle();

    if (error) {
      console.error(`Error checking user by ${by}:`, error);
      return {
        exists: false,
        error: `Database error: ${error.message}`
      };
    }

    // Return existence status
    return {
      exists: !!data
    };

  } catch (error) {
    console.error('Unexpected error in checkUser:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}