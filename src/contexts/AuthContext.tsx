import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Teacher } from '@/types/database.types';

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Development bypass - skip authentication entirely
    if (isDevelopmentBypass) {
      console.warn('⚠️ DEVELOPMENT MODE: Authentication bypassed');
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

    console.log('[AuthContext] Initializing auth...');
    console.log('[AuthContext] Current URL:', window.location.href);
    console.log('[AuthContext] Has hash fragment:', !!window.location.hash);
    console.log('[AuthContext] Has search params:', !!window.location.search);

    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = urlParams.get('error') || hashParams.get('error');
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    if (error) {
      console.error('[AuthContext] OAuth error in URL:', {
        error,
        description: errorDescription,
      });
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] Initial session check:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        error: error?.message,
        accessToken: session?.access_token ? 'present' : 'missing',
      });

      // Check localStorage for session data
      const storedSession = localStorage.getItem('sb-vidjivsvfdcokonkjwvh-auth-token');
      console.log('[AuthContext] LocalStorage session:', {
        exists: !!storedSession,
        length: storedSession?.length || 0,
      });

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AuthContext] Session found, loading teacher profile for:', session.user.email);
        loadTeacherProfile(session.user.email!);
      } else {
        console.log('[AuthContext] No session found, setting loading to false');
        setLoading(false);
      }
    });

    // Listen for auth changes (skip if in bypass mode)
    if (!isDevelopmentBypass) {
      console.log('[AuthContext] Setting up auth state change listener...');
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[AuthContext] Auth state changed:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email,
        });

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('[AuthContext] Loading teacher profile for:', session.user.email);
          loadTeacherProfile(session.user.email!);
        } else {
          console.log('[AuthContext] No session, clearing teacher');
          setTeacher(null);
          setLoading(false);
        }
      });

      return () => {
        console.log('[AuthContext] Unsubscribing from auth state changes');
        subscription.unsubscribe();
      };
    }
  }, []);

  const loadTeacherProfile = async (email: string) => {
    console.log('[AuthContext] loadTeacherProfile called for:', email);
    try {
      console.log('[AuthContext] Querying teachers table...');
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      console.log('[AuthContext] Teacher query result:', {
        hasData: !!data,
        teacherName: data?.name,
        error: error?.message,
        errorCode: error?.code,
      });

      if (error) {
        console.error('[AuthContext] Error from Supabase:', error);
        throw error;
      }

      if (!data) {
        console.warn('[AuthContext] No teacher found for email:', email);
        // User authenticated but not a teacher - sign them out
        console.log('[AuthContext] Signing out unauthorized user...');
        await supabase.auth.signOut();
        throw new Error('Acesso não autorizado. Apenas professores podem usar esta aplicação.');
      }

      console.log('[AuthContext] Teacher profile loaded successfully:', data.name);
      setTeacher(data);
    } catch (error) {
      console.error('[AuthContext] Error loading teacher profile:', error);
      setTeacher(null);
    } finally {
      console.log('[AuthContext] Setting loading to false');
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('[AuthContext] signInWithGoogle called');
    try {
      const redirectTo = `${window.location.origin}/`;
      console.log('[AuthContext] OAuth redirect URL:', redirectTo);

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
        console.error('[AuthContext] OAuth error:', error);
        throw error;
      }

      console.log('[AuthContext] OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthContext] Google sign in error:', authError);
      throw new Error(authError.message || 'Erro ao fazer login com Google');
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    console.log('[AuthContext] signInWithPassword called for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Password sign in error:', error);
        throw error;
      }

      // Session will be set by onAuthStateChange listener
      console.log('[AuthContext] Successfully signed in with password:', {
        userEmail: data.user.email,
        sessionExists: !!data.session,
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthContext] Password sign in error:', authError);
      throw new Error(authError.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut called');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext] Sign out error:', error);
        throw error;
      }
      console.log('[AuthContext] Successfully signed out');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthContext] Sign out error:', authError);
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
