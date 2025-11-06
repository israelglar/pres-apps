import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// Test users for local development
const TEST_USERS = [
  {
    email: 'admin@test.local',
    password: 'admin123',
    name: 'Admin Teacher',
    role: 'admin',
    description: 'Full access - can manage everything',
    icon: '👑',
  },
  {
    email: 'teacher@test.local',
    password: 'teacher123',
    name: 'Regular Teacher',
    role: 'teacher',
    description: 'Standard access - can mark attendance',
    icon: '👨‍🏫',
  },
  {
    email: 'viewer@test.local',
    password: 'viewer123',
    name: 'Viewer Only',
    role: 'viewer',
    description: 'Read-only access - can view data only',
    icon: '👀',
  },
] as const;

export const Route = createFileRoute('/dev-login')({
  component: DevLoginPage,
});

function DevLoginPage() {
  const { signInWithPassword, teacher, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Only show this page in development
  const isDev = import.meta.env.DEV;

  // Navigate to home once teacher profile is loaded after login
  useEffect(() => {
    console.log('[dev-login] Navigation effect:', {
      shouldNavigate,
      hasSession: !!session,
      hasTeacher: !!teacher,
      teacherName: teacher?.name,
    });

    if (shouldNavigate && session && teacher) {
      console.log('[dev-login] Navigating to home page...');
      navigate({ to: '/' });
    }
  }, [shouldNavigate, session, teacher, navigate]);

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-sm text-gray-600">
            Esta página só está disponível em modo de desenvolvimento.
          </p>
        </div>
      </div>
    );
  }

  const handleQuickLogin = async (email: string, password: string) => {
    console.log('[dev-login] handleQuickLogin called for:', email);
    try {
      setLoading(email);
      setError(null);

      console.log('[dev-login] Calling signInWithPassword...');
      await signInWithPassword(email, password);

      console.log('[dev-login] Sign in successful, setting shouldNavigate=true');
      // Flag that we should navigate once teacher profile loads
      setShouldNavigate(true);
    } catch (err) {
      console.error('[dev-login] Login error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dev Login
          </h1>
          <p className="text-sm text-gray-600">
            Escolha um utilizador de teste para iniciar sessão
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Test users */}
        <div className="space-y-4">
          {TEST_USERS.map((user) => (
            <button
              key={user.email}
              onClick={() => handleQuickLogin(user.email, user.password)}
              disabled={loading !== null}
              className="w-full p-5 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-teal-50 border-2 border-gray-200 hover:border-emerald-400 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{user.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {user.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-medium">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {user.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span className="font-mono">{user.email}</span>
                  </div>
                </div>
                {loading === user.email && (
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Estas credenciais só funcionam em desenvolvimento local
          </p>
        </div>
      </div>
    </div>
  );
}
