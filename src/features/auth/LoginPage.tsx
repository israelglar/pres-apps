import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/config/theme';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Erro ao fazer login. Por favor, tente novamente.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 bg-gray-50"
    >
      <div className={`w-full max-w-md ${theme.backgrounds.primaryLighter} rounded-2xl shadow-2xl p-8 border-2 ${theme.borders.primaryLight}`}>
        {/* Back button */}
        <button
          onClick={() => {
            // Use window.location to clear history and bypass auth redirect
            window.location.href = '/';
          }}
          className={`flex items-center gap-2 text-sm ${theme.text.primary} ${theme.backgrounds.primaryHover} mb-6 transition-colors font-medium`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
            Prés App
          </h1>
          <p className={`text-base font-medium ${theme.text.neutral}`}>
            Registo de Presenças
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 ${theme.backgrounds.errorLight} border ${theme.borders.error} rounded-lg`}>
            <p className={`text-sm ${theme.text.error}`}>{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-3 px-5 py-3 ${theme.backgrounds.white} border-2 ${theme.borders.primary} rounded-xl text-sm font-medium ${theme.text.primary} hover:shadow-md ${theme.borders.primaryHover} transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              A entrar...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Entrar com Google
            </>
          )}
        </button>

        {/* Info Text */}
        <p className={`mt-6 text-xs ${theme.text.neutralMedium} text-center`}>
          Apenas professores autorizados podem fazer login
        </p>
      </div>
    </div>
  );
}
