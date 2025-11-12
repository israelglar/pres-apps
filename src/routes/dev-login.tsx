import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { theme } from '@/config/theme';

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
    if (shouldNavigate && session && teacher) {
      navigate({ to: '/' });
    }
  }, [shouldNavigate, session, teacher, navigate]);

  if (!isDev) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.backgrounds.errorDark} p-5`}>
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${theme.text.error}`} />
          <h1 className={`text-2xl font-bold ${theme.text.neutralDarkest} mb-2`}>
            Acesso Negado
          </h1>
          <p className={`text-sm ${theme.text.neutral}`}>
            Esta página só está disponível em modo de desenvolvimento.
          </p>
        </div>
      </div>
    );
  }

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      setLoading(email);
      setError(null);

      await signInWithPassword(email, password);

      // Flag that we should navigate once teacher profile loads
      setShouldNavigate(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      setLoading(null);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.solids.background} p-5`}>
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/' })}
          className={`flex items-center gap-2 text-sm ${theme.text.neutral} ${theme.text.neutralDarkest} mb-6 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${theme.solids.background} rounded-full mb-4`}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text.neutralDarkest} mb-2`}>
            Dev Login
          </h1>
          <p className={`text-sm ${theme.text.neutral}`}>
            Escolha um utilizador de teste para iniciar sessão
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className={`mb-6 p-4 ${theme.backgrounds.errorLight} border ${theme.borders.error} rounded-lg flex items-start gap-3`}>
            <AlertCircle className={`w-5 h-5 ${theme.text.error} flex-shrink-0 mt-0.5`} />
            <div className={`text-sm ${theme.text.error}`}>{error}</div>
          </div>
        )}

        {/* Test users */}
        <div className="space-y-4">
          {TEST_USERS.map((user) => (
            <button
              key={user.email}
              onClick={() => handleQuickLogin(user.email, user.password)}
              disabled={loading !== null}
              className={`w-full p-5 ${theme.solids.neutralButton} ${theme.solids.devCardHover} border-2 ${theme.borders.neutralLight} ${theme.borders.primaryHover} rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{user.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-bold ${theme.text.neutralDarkest}`}>
                      {user.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 ${theme.backgrounds.neutral} ${theme.text.neutralDark} rounded-full font-medium`}>
                      {user.role}
                    </span>
                  </div>
                  <p className={`text-xs ${theme.text.neutral} mb-2`}>
                    {user.description}
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${theme.text.neutralMedium}`}>
                    <User className="w-3 h-3" />
                    <span className="font-mono">{user.email}</span>
                  </div>
                </div>
                {loading === user.email && (
                  <Loader2 className={`w-5 h-5 ${theme.text.primary} animate-spin flex-shrink-0`} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info footer */}
        <div className={`mt-8 pt-6 border-t ${theme.borders.neutralLight}`}>
          <p className={`text-xs ${theme.text.neutralMedium} text-center`}>
            💡 Estas credenciais só funcionam em desenvolvimento local
          </p>
        </div>
      </div>
    </div>
  );
}
