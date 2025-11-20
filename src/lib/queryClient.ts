import { QueryClient } from '@tanstack/react-query';
import { QUERY } from '../config/constants';

/**
 * TanStack Query client configuration
 *
 * Default settings:
 * - Queries are cached for 60 minutes (matching old cache duration)
 * - Stale time is 55 minutes (refetch 5 min before cache expires)
 * - Retry failed requests 3 times with exponential backoff
 * - Refetch on window focus (when user returns to app)
 * - Errors bubble up to error boundaries for proper handling
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY.STALE_TIME_XLARGE, // 55 minutes
      gcTime: QUERY.CACHE_TIME_DEFAULT, // 60 minutes (formerly cacheTime)
      retry: QUERY.MAX_QUERY_RETRIES,
      retryDelay: (attemptIndex) => Math.min(QUERY.INITIAL_RETRY_DELAY * 2 ** attemptIndex, QUERY.MAX_RETRY_DELAY),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // throwOnError: false allows errors to be handled by error boundaries
      throwOnError: false,
    },
    mutations: {
      retry: QUERY.MAX_MUTATION_RETRIES,
      retryDelay: QUERY.INITIAL_RETRY_DELAY,
      // Mutations errors are handled by individual mutation error handlers
    },
  },
});
