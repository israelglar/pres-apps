import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { Code2 } from 'lucide-react';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { useAttendanceSubmit } from './hooks/useAttendanceData';
import { SavingOverlay } from './components/ui/SavingOverlay';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DevTools } from './features/home/DevTools';
import { theme } from './config/theme';

/**
 * Main App Component
 *
 * Provides application-wide contexts:
 * - Authentication (AuthProvider)
 * - TanStack Query (QueryClientProvider)
 * - Router with auth context
 * - Global saving overlay
 *
 * All data fetching and state management:
 * - TanStack Query (server state)
 * - Zustand stores (client state)
 * - Custom hooks (business logic)
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isSaving, saveError } = useAttendanceSubmit();
  const auth = useAuth();
  const [showDevTools, setShowDevTools] = useState(false);

  // Wait for authentication to load before rendering router
  // This prevents protected routes from rendering before auth is determined
  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  // Check if dev bypass is enabled
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

  return (
    <>
      {isSaving && (
        <SavingOverlay
          error={saveError}
          onRetry={() => {
            // Note: We can't easily retry from here, user will need to re-mark
            // This is a limitation we can improve later
          }}
        />
      )}

      {/* Dev bypass warning banner */}
      {isDevBypass && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-xs font-semibold z-50 shadow-lg">
          ⚠️ MODO DESENVOLVIMENTO - Autenticação Desativada
        </div>
      )}

      {/* Dev Tools Button - Fixed top left - Only show in development mode */}
      {import.meta.env.DEV && (
        <button
          onClick={() => setShowDevTools(true)}
          className={`fixed bottom-4 left-4 p-2 ${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primaryLight} rounded-lg ${theme.backgrounds.primaryHover} hover:shadow-md transition-all z-50`}
          aria-label="Dev Tools"
          title="Dev Tools"
        >
          <Code2 className="w-5 h-5" />
        </button>
      )}

      {/* Dev Tools Modal - Only show in development mode */}
      {import.meta.env.DEV && (
        <DevTools
          isOpen={showDevTools}
          onClose={() => setShowDevTools(false)}
        />
      )}

      <RouterProvider router={router} context={{ auth }} />
    </>
  );
}
