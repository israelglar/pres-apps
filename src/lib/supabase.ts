import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
// In development, replace localhost with current hostname to support network access
const getSupabaseUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

  // In development, if we're not on localhost, replace localhost in Supabase URL
  // This allows the app to work from both localhost and network IP
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return envUrl.replace('localhost', hostname);
    }
  }

  return envUrl;
};

const supabaseUrl = getSupabaseUrl();
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
    flowType: 'pkce', // Explicitly use PKCE flow
    debug: true, // Enable debug logging
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
