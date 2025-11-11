/**
 * Unified hook for service times queries
 * Provides centralized service times data fetching with TanStack Query caching
 */

import { useQuery } from '@tanstack/react-query';
import { getActiveServiceTimes } from '../api/supabase/service-times';

/**
 * Fetch all active service times
 */
export function useServiceTimes() {
  return useQuery({
    queryKey: ['service-times'],
    queryFn: getActiveServiceTimes,
  });
}
