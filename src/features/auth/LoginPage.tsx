import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/config/theme';
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
      className={`min-h-screen flex items-center justify-center p-5 ${theme.gradients.background}`}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prés App
          </h1>
          <p className="text-base font-medium text-gray-600">
            Registo de Presenças
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
        <p className="mt-6 text-xs text-gray-500 text-center">
          Apenas professores autorizados podem fazer login
        </p>
      </div>
    </div>
  );
}
