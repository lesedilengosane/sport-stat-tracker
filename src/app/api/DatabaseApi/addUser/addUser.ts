import { supabase } from "../supabaseClient";

export type UserRole = "Coach" | "Analyst" | "Fan";

export interface UserData {
  auth_user_id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

/**
 * Creates a new user in the users table
 * @param userData - User data to insert
 */
export async function createUser(userData: UserData) {
  const { data, error } = await supabase
    .from("users")
    .insert([{
      auth_user_id: userData.auth_user_id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role
    }])
    .select();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  return data[0];
}
