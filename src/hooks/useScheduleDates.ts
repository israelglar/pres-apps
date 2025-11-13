/**
 * Unified hook for schedule dates queries
 * Provides centralized schedule dates data fetching with TanStack Query caching
 */

import { useQuery } from '@tanstack/react-query';
import { getScheduleDates } from '../api/supabase/schedules';
import { queryKeys } from '../lib/queryKeys';

/**
 * Fetch all unique dates that have schedules
 */
export function useScheduleDates() {
  return useQuery({
    queryKey: queryKeys.scheduleDates(),
    queryFn: getScheduleDates,
  });
}
