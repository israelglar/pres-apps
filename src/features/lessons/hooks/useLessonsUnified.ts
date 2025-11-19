/**
 * Custom hook for fetching unified lesson data
 * Returns one entry per unique lesson with all schedules aggregated
 * Eliminates duplicates and correctly counts total lessons
 */

import { useQuery } from '@tanstack/react-query';
import { getAllLessons } from '../../../api/supabase/lessons';
import { getAllSchedules } from '../../../api/supabase/schedules';
import type { Lesson, ScheduleWithRelations } from '../../../types/database.types';

/**
 * Query key for unified lessons
 */
export const UNIFIED_LESSONS_QUERY_KEY = ['lessons-unified'] as const;

/**
 * Unified lesson type - one lesson with all its schedules
 */
export interface UnifiedLesson {
  lesson: Lesson;
  schedules: ScheduleWithRelations[];
  isScheduled: boolean;
  scheduleCount: number;
}

/**
 * Custom hook to fetch all lessons with their schedules aggregated
 * Each lesson appears only once, with all schedules grouped together
 */
export function useLessonsUnified() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: UNIFIED_LESSONS_QUERY_KEY,
    queryFn: async (): Promise<UnifiedLesson[]> => {
      // Fetch all data in parallel
      const [allLessons, allSchedules] = await Promise.all([
        getAllLessons(),
        getAllSchedules(),
      ]);

      // Group schedules by lesson_id
      const schedulesByLessonId = new Map<number, ScheduleWithRelations[]>();
      allSchedules.forEach((schedule) => {
        if (schedule.lesson_id !== null) {
          const existing = schedulesByLessonId.get(schedule.lesson_id) || [];
          existing.push(schedule);
          schedulesByLessonId.set(schedule.lesson_id, existing);
        }
      });

      // Create unified lesson objects
      const unifiedLessons: UnifiedLesson[] = allLessons.map((lesson) => {
        const schedules = schedulesByLessonId.get(lesson.id) || [];

        // Sort schedules by date (oldest first)
        schedules.sort((a, b) => a.date.localeCompare(b.date));

        return {
          lesson,
          schedules,
          isScheduled: schedules.length > 0,
          scheduleCount: schedules.length,
        };
      });

      // Sort: scheduled lessons first (by most recent schedule date), then unscheduled
      unifiedLessons.sort((a, b) => {
        if (a.isScheduled && !b.isScheduled) return -1;
        if (!a.isScheduled && b.isScheduled) return 1;

        if (a.isScheduled && b.isScheduled) {
          // Both scheduled - sort by oldest schedule date
          const aDate = a.schedules[0]?.date || '';
          const bDate = b.schedules[0]?.date || '';
          return aDate.localeCompare(bDate);
        }

        // Both unscheduled - sort by curriculum series and lesson number
        const aSeriesOrder = a.lesson.curriculum_series || 'ZZZ';
        const bSeriesOrder = b.lesson.curriculum_series || 'ZZZ';
        if (aSeriesOrder !== bSeriesOrder) {
          return aSeriesOrder.localeCompare(bSeriesOrder);
        }
        return (a.lesson.lesson_number || 0) - (b.lesson.lesson_number || 0);
      });

      return unifiedLessons;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    unifiedLessons: data,
    totalCount: data?.length ?? 0,
    scheduledCount: data?.filter((ul) => ul.isScheduled).length ?? 0,
    unscheduledCount: data?.filter((ul) => !ul.isScheduled).length ?? 0,
    isLoading,
    error,
    refetch,
  };
}
