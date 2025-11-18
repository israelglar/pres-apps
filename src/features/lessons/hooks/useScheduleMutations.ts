/**
 * Custom hook for schedule mutation operations
 * Wraps Supabase API with TanStack Query for mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSchedule } from '../../../api/supabase/schedules';
import type { ScheduleInsert } from '../../../types/database.types';

/**
 * Create a new schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: ScheduleInsert) => createSchedule(schedule),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['unscheduled-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-dates'] });
    },
  });
}
