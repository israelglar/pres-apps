import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration
 *
 * Default settings:
 * - Queries are cached for 60 minutes (matching old cache duration)
 * - Stale time is 55 minutes (refetch 5 min before cache expires)
 * - Retry failed requests 3 times with exponential backoff
 * - Refetch on window focus (when user returns to app)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 55 * 60 * 1000, // 55 minutes
      gcTime: 60 * 60 * 1000, // 60 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});
