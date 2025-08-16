import { createClient } from "@supabase/supabase-js";

// Make sure these are set in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or ANON KEY is missing. Please check .env.local"
  );
}

// Node 18+ already has fetch, so this works in App Router API
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
