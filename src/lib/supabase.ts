import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Supabase client instance
 *
 * Configured with:
 * - Public anon key for client-side access
 * - Auto-refresh tokens enabled
 * - Session persistence in localStorage
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable OAuth redirect detection
    storage: localStorage, // Use localStorage for session persistence
  },
});

/**
 * Helper function to handle Supabase errors consistently
 */
export function handleSupabaseError(error: unknown): never {
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(`Database error: ${(error as { message: string }).message}`);
  }
  throw new Error('An unexpected database error occurred');
}
