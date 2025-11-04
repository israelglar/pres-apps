import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { useAttendanceSubmit } from './hooks/useAttendanceData';
import { SavingOverlay } from './components/ui/SavingOverlay';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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

      <RouterProvider router={router} context={{ auth }} />
    </>
  );
}
