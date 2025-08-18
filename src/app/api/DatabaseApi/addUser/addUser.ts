import { supabase } from "../supabaseClient";

export type UserRole = "Coach" | "Analyst" | "Fan";

export interface UserData {
  auth_user_id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

/**
 * Creates a new user in the users table if they don't exist
 * @param userData - User data to insert
 * @returns {Promise<{success: boolean, data?: any, error?: string, userExists?: boolean}>}
 */
export async function addUser(userData: UserData) {
  try {
    // 1. First check if user exists
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("auth_user_id")
      .eq("auth_user_id", userData.auth_user_id)
      .maybeSingle();

    if (queryError) {
      console.error("Error checking user existence:", queryError);
      throw new Error("Failed to check user existence");
    }

    if (existingUser) {
      return {
        success: false,
        error: "User already exists",
        userExists: true
      };
    }

    // 2. If user doesn't exist, create them
    const { data, error: insertError } = await supabase
      .from("users")
      .insert([{
        auth_user_id: userData.auth_user_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      }])
      .select();

    if (insertError) {
      console.error("Error creating user:", insertError);
      throw insertError;
    }

    return {
      success: true,
      data: data[0],
      userExists: false
    };

  } catch (error) {
    console.error("Unexpected error in addUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      userExists: false
    };
  }
}