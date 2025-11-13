import { useAuth } from '@/contexts/AuthContext';
import { buttonClasses, theme } from '@/config/theme';
import { LogIn, Loader2 } from 'lucide-react';
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
      className={`min-h-screen flex items-center justify-center p-5 ${theme.backgrounds.page}`}
    >
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-5 border-2 ${theme.borders.primaryLight}`}>
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
              Prés App
            </h1>
            <p className={`text-sm ${theme.text.neutral}`}>
              Registo de Presenças
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-5 p-5 ${theme.backgrounds.errorLight} border-2 ${theme.borders.error} rounded-xl`}>
              <p className={`text-sm ${theme.text.error} font-semibold`}>{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full ${buttonClasses.primary} flex items-center justify-center gap-3`}
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
          <p className={`mt-5 text-xs ${theme.text.neutral} text-center`}>
            Apenas professores autorizados podem fazer login
          </p>
        </div>
      </div>
    </div>
  );
}
