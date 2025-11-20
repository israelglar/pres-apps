import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAllSchedules } from '../../../api/supabase/schedules';
import { queryKeys } from '../../../lib/queryKeys';

/**
 * Hook to check if there are past lessons available for adding attendance
 * @param existingDates - Set of dates that already have attendance records
 * @returns boolean indicating if there are available past lessons
 */
export function useHasAvailablePastLessons(existingDates: Set<string>): boolean {
  // Fetch all schedules
  const { data: allSchedules = [] } = useQuery({
    queryKey: queryKeys.schedules(),
    queryFn: getAllSchedules,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check if there are any past schedules without attendance
  const hasAvailablePastLessons = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allSchedules.some((schedule) => {
      const scheduleDate = new Date(schedule.date);
      scheduleDate.setHours(0, 0, 0, 0);

      // Only past dates that don't already have attendance
      return scheduleDate < today && !existingDates.has(schedule.date);
    });
  }, [allSchedules, existingDates]);

  return hasAvailablePastLessons;
}
