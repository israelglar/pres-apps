import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { useAttendanceSubmit } from './hooks/useAttendanceData';
import { SavingOverlay } from './components/ui/SavingOverlay';

/**
 * Main App Component
 *
 * Simplified to only handle:
 * - TanStack Query provider setup
 * - Router provider setup
 * - Global saving overlay
 *
 * All data fetching and state management moved to:
 * - TanStack Query (server state)
 * - Zustand stores (client state)
 * - Custom hooks (business logic)
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isSaving, saveError } = useAttendanceSubmit();

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

      <RouterProvider router={router} />
    </>
  );
}
