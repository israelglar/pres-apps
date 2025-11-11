import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllSchedules } from '../../../api/supabase/schedules';
import { getAttendanceBySchedule, updateAttendanceRecord } from '../../../api/supabase/attendance';
import type { ScheduleWithRelations, AttendanceRecordWithRelations } from '../../../types/database.types';
import { calculateStats, type AttendanceStats } from '../../../utils/attendance';

/**
 * Query key for attendance history
 */
export const ATTENDANCE_HISTORY_QUERY_KEY = ['attendance-history'] as const;

/**
 * Type for grouped attendance data by date
 */
export interface AttendanceHistoryGroup {
  schedule: ScheduleWithRelations;
  records: AttendanceRecordWithRelations[];
  stats: AttendanceStats;
}

/**
 * Custom hook to fetch attendance history with pagination
 * Loads the last N schedules with attendance data
 * Filters by service time (e.g., '09:00:00' or '11:00:00')
 */
export function useAttendanceHistory(limit: number = 5, serviceTimeFilter?: string) {
  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: [...ATTENDANCE_HISTORY_QUERY_KEY, limit, serviceTimeFilter],
    queryFn: async (): Promise<AttendanceHistoryGroup[]> => {
      // Get all schedules ordered by date (most recent first)
      const allSchedules = await getAllSchedules();

      // Filter to only schedules that are in the past or today
      const today = new Date().toISOString().split('T')[0];
      let pastSchedules = allSchedules.filter(schedule => schedule.date <= today);

      // Filter by service time if specified
      if (serviceTimeFilter) {
        pastSchedules = pastSchedules.filter(schedule =>
          schedule.service_time?.time === serviceTimeFilter
        );
      }

      // Take only the specified limit
      const limitedSchedules = pastSchedules.slice(0, limit);

      // Fetch attendance for each schedule
      const historyData = await Promise.all(
        limitedSchedules.map(async (schedule) => {
          const records = await getAttendanceBySchedule(schedule.id);

          return {
            schedule,
            records,
            stats: calculateStats(records),
          };
        })
      );

      return historyData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    history,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to handle editing a single attendance record
 * Includes optimistic updates for instant UI feedback
 */
export function useEditAttendance() {
  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationFn: async ({
      recordId,
      status,
      notes
    }: {
      recordId: number;
      status: 'present' | 'absent' | 'excused' | 'late';
      notes?: string;
    }) => {
      return updateAttendanceRecord(recordId, { status, notes });
    },

    // Optimistic update - instantly update UI before server responds
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ATTENDANCE_HISTORY_QUERY_KEY });

      // Snapshot previous value
      const previousHistory = queryClient.getQueryData(ATTENDANCE_HISTORY_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ATTENDANCE_HISTORY_QUERY_KEY },
        (old: AttendanceHistoryGroup[] | undefined) => {
          if (!old) return old;

          return old.map(group => ({
            ...group,
            records: group.records.map(record =>
              record.id === variables.recordId
                ? { ...record, status: variables.status, notes: variables.notes }
                : record
            ),
            stats: calculateStats(
              group.records.map(record =>
                record.id === variables.recordId
                  ? { ...record, status: variables.status }
                  : record
              )
            ),
          }));
        }
      );

      // Return rollback context
      return { previousHistory };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(ATTENDANCE_HISTORY_QUERY_KEY, context.previousHistory);
      }
    },

    // Always refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_HISTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['schedules'] }); // Invalidate schedules cache
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] }); // Invalidate today's attendance
    },
  });

  return {
    editAttendance: editMutation.mutateAsync,
    isEditing: editMutation.isPending,
    editError: editMutation.error,
  };
}

/**
 * Hook to load more history (pagination)
 */
export function useLoadMoreHistory(currentLimit: number) {
  return {
    loadMore: () => currentLimit + 5,
  };
}
