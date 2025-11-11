/**
 * Unified hook for schedule dates queries
 * Provides centralized schedule dates data fetching with TanStack Query caching
 */

import { useQuery } from '@tanstack/react-query';
import { getScheduleDates } from '../api/supabase/schedules';

/**
 * Fetch all unique dates that have schedules
 */
export function useScheduleDates() {
  return useQuery({
    queryKey: ['schedule-dates'],
    queryFn: getScheduleDates,
  });
}
