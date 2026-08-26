import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";


// Server/admin client
// Use this for database operations that need the secret key.
export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);


// Public/auth client
// Use this for sign up and login.
export const supabaseAuth = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);


export const checkDatabaseConnection = async () => {
  return true;
};