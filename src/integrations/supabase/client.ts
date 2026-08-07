import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Supabase URL or Anon Key is not defined in environment variables. Please check your .env file.';
  console.error(errorMessage);
  // Throw an error to prevent the app from proceeding with an uninitialized Supabase client
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);