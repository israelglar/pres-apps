/**
 * Custom hook for fetching lessons that are not scheduled
 * A lesson is considered unscheduled if it doesn't have any schedules linked to it
 */

import { useQuery } from '@tanstack/react-query';
import { getAllLessons } from '../../../api/supabase/lessons';
import { getAllSchedules } from '../../../api/supabase/schedules';
import type { Lesson } from '../../../types/database.types';

/**
 * Fetch all lessons that don't have any schedules
 */
export function useUnscheduledLessons() {
  return useQuery({
    queryKey: ['unscheduled-lessons'],
    queryFn: async (): Promise<Lesson[]> => {
      // Fetch all lessons and schedules in parallel
      const [allLessons, allSchedules] = await Promise.all([
        getAllLessons(),
        getAllSchedules(),
      ]);

      // Create a Set of lesson IDs that have schedules
      const scheduledLessonIds = new Set(
        allSchedules
          .map((schedule) => schedule.lesson_id)
          .filter((id): id is number => id !== null)
      );

      // Filter lessons that are not in any schedule
      const unscheduledLessons = allLessons.filter(
        (lesson) => !scheduledLessonIds.has(lesson.id)
      );

      return unscheduledLessons;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
