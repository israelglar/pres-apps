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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTeacherProfile(session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (skip if in bypass mode)
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

      return () => subscription.unsubscribe();
    }
  }, []);

  const loadTeacherProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!data) {
        // User authenticated but not a teacher - sign them out
        await supabase.auth.signOut();
        throw new Error('Acesso não autorizado. Apenas professores podem usar esta aplicação.');
      }

      setTeacher(data);
    } catch (error) {
      console.error('Error loading teacher profile:', error);
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Google sign in error:', authError);
      throw new Error(authError.message || 'Erro ao fazer login com Google');
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Session will be set by onAuthStateChange listener
      console.log('Successfully signed in with password:', data.user.email);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Password sign in error:', authError);
      throw new Error(authError.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError);
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
