// app/api/DatabaseApi/checkUser/checkUser.ts
import { supabase } from "../supabaseClient";

/**
 * Checks if a user exists in the database and retrieves role + first_name
 * @param identifier - Can be either auth_user_id or email
 * @param by - Field to check by ('auth_user_id' or 'email')
 * @returns Promise<{ exists: boolean, role?: string, first_name?: string, error?: string }>
 */
export async function checkUser(
  identifier: string,
  by: 'auth_user_id' | 'email' = 'auth_user_id'
): Promise<{ exists: boolean; role?: string; first_name?: string;last_name?:string;user_id?:string; error?: string }> {
  try {
    // Validate input
    if (!identifier) {
      return {
        exists: false,
        error: 'Identifier is required'
      };
    }

    // Query the database for role + first_name too
    const { data, error } = await supabase
      .from('users')
      .select("*")
      .eq(by, identifier)
      .maybeSingle();

    if (error) {
      console.error(`Error checking user by ${by}:`, error);
      return {
        exists: false,
        error: `Database error: ${error.message}`
      };
    }

    if (!data) {
      return { 
        exists: false, 
        user_id: undefined,
        role: undefined, 
        first_name: undefined, 
        last_name: undefined,
        
      };
    }

    // Return existence + user details
   // console.log("Raw Supabase data:", data);
const result = {
  exists: true,
  user_id: data.user_id,
  role: data.role,
  first_name: data.first_name,
  last_name: data.last_name,
};
//console.log("Returning result:", result);
return result;

  } catch (error) {
    console.error('Unexpected error in checkUser:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}