/**
 * Unified hook for schedule queries
 * Provides centralized schedule data fetching with TanStack Query caching
 */

import { useQuery } from '@tanstack/react-query';
import { getAllSchedules } from '../api/supabase/schedules';
import { queryKeys } from '../lib/queryKeys';

/**
 * Fetch all schedules with relations
 * Future: Add optional filtering by date range, service time, etc.
 */
export function useSchedules() {
  return useQuery({
    queryKey: queryKeys.schedules(),
    queryFn: getAllSchedules,
  });
}
