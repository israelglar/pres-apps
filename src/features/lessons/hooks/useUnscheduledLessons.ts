/**
 * Custom hook for fetching lessons that are not scheduled
 * A lesson is considered unscheduled if it doesn't have any schedules linked to it
 *
 * OPTIMIZATION: Derives scheduled lesson IDs from the cached 'lessons' query data
 * instead of fetching schedules again. This eliminates a duplicate API call.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllLessons } from '../../../api/supabase/lessons';
import type { Lesson } from '../../../types/database.types';
import { LESSONS_QUERY_KEY, type LessonGroup } from './useLessons';

/**
 * Fetch all lessons that don't have any schedules
 */
export function useUnscheduledLessons() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['unscheduled-lessons'],
    queryFn: async (): Promise<Lesson[]> => {
      // Fetch all lessons
      const allLessons = await getAllLessons();

      // Try to get scheduled lesson IDs from cached lessons data
      const cachedLessonsData = queryClient.getQueryData<{
        history: LessonGroup[];
        totalCount: number;
      }>(LESSONS_QUERY_KEY);

      // Extract scheduled lesson IDs from cache if available
      const scheduledLessonIds = new Set<number>();
      if (cachedLessonsData?.history) {
        cachedLessonsData.history.forEach((group) => {
          group.serviceTimes.forEach((st) => {
            if (st.schedule.lesson_id !== null) {
              scheduledLessonIds.add(st.schedule.lesson_id);
            }
          });
        });
      }

      // Filter lessons that are not in any schedule
      const unscheduledLessons = allLessons.filter(
        (lesson) => !scheduledLessonIds.has(lesson.id)
      );

      return unscheduledLessons;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - same as useLessons
    refetchOnMount: true, // Only refetch if stale
  });
}
