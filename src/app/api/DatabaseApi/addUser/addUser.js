import { supabase } from "../supabaseClient";


/**
 * Creates a new user in the users table
 * @param {Object} userData - User data to insert
 * @param {'Coach'|'Analyst'|'Fan'} userData.role - User's role
 */

export async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      auth_user_id: userData.auth_user_id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role
    }])
    .select()

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }

  return data[0]
}

