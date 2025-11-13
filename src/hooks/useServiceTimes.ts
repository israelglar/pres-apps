/**
 * Unified hook for service times queries
 * Provides centralized service times data fetching with TanStack Query caching
 */

import { useQuery } from '@tanstack/react-query';
import { getActiveServiceTimes } from '../api/supabase/service-times';
import { queryKeys } from '../lib/queryKeys';

/**
 * Fetch all active service times
 */
export function useServiceTimes() {
  return useQuery({
    queryKey: queryKeys.serviceTimes(),
    queryFn: getActiveServiceTimes,
  });
}
