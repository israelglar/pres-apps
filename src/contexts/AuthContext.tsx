import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Teacher } from '@/types/database.types';
import { logger } from '@/utils/logger';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  teacher: Teacher | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we should bypass auth in development
const isDevelopmentBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

// Mock teacher for development bypass
const mockDevTeacher: Teacher = {
  id: 1,
  name: 'Dev Teacher',
  email: 'dev@local',
  is_active: true,
  role: 'admin',
  phone: null,
  auth_user_id: null,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Development bypass - skip authentication entirely
    if (isDevelopmentBypass) {
      logger.warn('⚠️ DEVELOPMENT MODE: Authentication bypassed');
      // Create a mock session for dev mode
      const mockSession = {
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'dev-user-id',
          email: 'dev@local',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      } as Session;

      setSession(mockSession);
      setUser(mockSession.user);
      setTeacher(mockDevTeacher);
      setLoading(false);
      return;
    }

    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = urlParams.get('error') || hashParams.get('error');
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    if (error) {
      logger.error('[AuthContext] OAuth error in URL:', {
        error,
        description: errorDescription,
      });
    }

    // Listen for auth changes FIRST (skip if in bypass mode)
    // This is critical - the listener needs to be set up BEFORE getSession()
    // so it can catch the SIGNED_IN event from OAuth callback
    let unsubscribe: (() => void) | undefined;
    if (!isDevelopmentBypass) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadTeacherProfile(session.user.email!);
        } else {
          setTeacher(null);
          setLoading(false);
        }
      });

      // Store unsubscribe function for cleanup
      unsubscribe = () => {
        subscription.unsubscribe();
      };
    }

    // Get initial session AFTER setting up the listener
    // Important: Add a small delay to allow Supabase to process URL hash
    const hasHashFragment = window.location.hash.includes('access_token');
    const hasAuthCode = urlParams.has('code');

    const initializeSession = async () => {
      // Handle PKCE flow: exchange authorization code for session
      if (hasAuthCode) {
        const code = urlParams.get('code')!;

        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            logger.error('[AuthContext] Error exchanging code for session:', error);
          } else if (data.session) {
            // Clear the code from URL
            window.history.replaceState(null, '', window.location.pathname);

            return; // Let the auth state change listener handle the rest
          }
        } catch (err) {
          logger.error('[AuthContext] Exception exchanging code:', err);
        }
      }

      // If there's an OAuth callback in the URL, manually exchange the code/token
      if (hasHashFragment) {
        // Parse hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          try {
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              logger.error('[AuthContext] Error setting session:', error);
            } else if (data.session) {
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);

              return; // Let the auth state change listener handle the rest
            }
          } catch (err) {
            logger.error('[AuthContext] Exception setting session:', err);
          }
        }

        // Give Supabase one more chance to process it automatically
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTeacherProfile(session.user.email!);
      } else {
        // Only set loading to false if no OAuth callback in progress (otherwise listener will handle it)
        if (!hasHashFragment && !hasAuthCode) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    // Return cleanup function
    return unsubscribe;
  }, []);

  const loadTeacherProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) {
        logger.error('[AuthContext] Error from Supabase:', error);
        throw error;
      }

      if (!data) {
        // User authenticated but not a teacher - sign them out
        await supabase.auth.signOut();
        throw new Error('Acesso não autorizado. Apenas professores podem usar esta aplicação.');
      }

      setTeacher(data);

      // After successful OAuth callback and teacher load, redirect to home if on login page
      // Use replace to clear history so back button doesn't go back to login
      if (window.location.pathname === '/login') {
        window.history.replaceState(null, '', '/');
        // Force a navigation event to update the router
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (error) {
      logger.error('[AuthContext] Error loading teacher profile:', error);
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        logger.error('[AuthContext] OAuth error:', error);
        throw error;
      }
    } catch (error) {
      const authError = error as AuthError;
      logger.error('[AuthContext] Google sign in error:', authError);
      throw new Error(authError.message || 'Erro ao fazer login com Google');
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('[AuthContext] Password sign in error:', error);
        throw error;
      }

      // Session will be set by onAuthStateChange listener
    } catch (error) {
      const authError = error as AuthError;
      logger.error('[AuthContext] Password sign in error:', authError);
      throw new Error(authError.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    try {
      // Clear all cached queries before signing out
      // This ensures fresh data is loaded when a different user logs in
      queryClient.clear();

      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('[AuthContext] Sign out error:', error);
        throw error;
      }

      // Redirect to login page after successful sign out
      window.location.href = '/login';
    } catch (error) {
      const authError = error as AuthError;
      logger.error('[AuthContext] Sign out error:', authError);
      throw new Error(authError.message || 'Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, user, teacher, loading, signInWithGoogle, signInWithPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
