import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllSchedules } from '../../../api/supabase/schedules';
import {
  getAttendanceBySchedule,
  updateAttendanceRecord,
  createAttendanceRecord,
  deleteAttendanceRecord,
} from '../../../api/supabase/attendance';
import type { ScheduleWithRelations, AttendanceRecordWithRelations } from '../../../types/database.types';
import { calculateStats, type AttendanceStats } from '../../../utils/attendance';

/**
 * Query key for lessons
 */
export const LESSONS_QUERY_KEY = ['lessons'] as const;

/**
 * Type for service time data within a date group
 */
export interface ServiceTimeData {
  schedule: ScheduleWithRelations;
  records: AttendanceRecordWithRelations[];
  stats: AttendanceStats;
}

/**
 * Type for grouped lesson data by date
 * Each date can have multiple service times (09h, 11h)
 */
export interface LessonGroup {
  date: string;
  serviceTimes: ServiceTimeData[];
}

/**
 * Custom hook to fetch all attendance history
 * Loads ALL schedules at once (no pagination)
 * Groups by date, showing all service times for each date
 * Orders oldest first (ascending)
 */
export function useLessons() {
  const queryClient = useQueryClient();

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: LESSONS_QUERY_KEY,
    queryFn: async (): Promise<{
      history: LessonGroup[];
      totalCount: number;
    }> => {
      // Get all schedules ordered by date (most recent first by default)
      const allSchedules = await getAllSchedules();

      // Group all schedules by date (no date filtering - show ALL lessons)
      const schedulesByDate = allSchedules.reduce((acc, schedule) => {
        if (!acc[schedule.date]) {
          acc[schedule.date] = [];
        }
        acc[schedule.date].push(schedule);
        return acc;
      }, {} as Record<string, ScheduleWithRelations[]>);

      // Get unique dates and sort in ascending order (oldest first)
      const uniqueDates = Object.keys(schedulesByDate).sort((a, b) => a.localeCompare(b));

      const totalCount = uniqueDates.length;

      // Fetch attendance for ALL dates
      const historyData = await Promise.all(
        uniqueDates.map(async (date) => {
          const schedulesForDate = schedulesByDate[date];

          // Fetch attendance for each service time on this date
          const serviceTimesData = await Promise.all(
            schedulesForDate.map(async (schedule) => {
              const records = await getAttendanceBySchedule(schedule.id);

              return {
                schedule,
                records,
                stats: calculateStats(records),
              };
            })
          );

          // Sort service times by time (09:00 before 11:00)
          serviceTimesData.sort((a, b) =>
            (a.schedule.service_time?.time || '').localeCompare(b.schedule.service_time?.time || '')
          );

          return {
            date,
            serviceTimes: serviceTimesData,
          };
        })
      );

      return {
        history: historyData,
        totalCount,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Validate and fix data structure before returning to components
    select: (data: any) => {
      // If data has correct structure, return as-is
      if (data && typeof data === 'object' && !Array.isArray(data) && data.history && data.totalCount !== undefined) {
        return data as { history: LessonGroup[]; totalCount: number };
      }

      // If data is corrupted (wrong structure), clear cache and return undefined
      // This will cause the query to refetch with correct structure
      console.error('[useLessons] CORRUPTED DATA DETECTED IN SELECT! Clearing cache...', {
        data,
        isArray: Array.isArray(data),
        type: typeof data,
      });

      // Clear the corrupted cache asynchronously (don't block this render)
      setTimeout(() => {
        console.warn('[useLessons] Removing corrupted cache and invalidating query');
        queryClient.removeQueries({ queryKey: LESSONS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY });
      }, 0);

      // Return undefined to indicate no valid data
      return undefined;
    },
  });

  // Debug: Log if response exists but data is missing (after query returns)
  if (response && (!response.history || response.totalCount === undefined)) {
    console.error('[useLessons] WARNING: Query returned invalid structure!', {
      response,
      hasHistory: 'history' in response,
      hasTotalCount: 'totalCount' in response,
      isArray: Array.isArray(response),
    });
  }

  return {
    history: response?.history,
    totalCount: response?.totalCount ?? 0,
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
      notes?: string | null;
    }) => {
      return updateAttendanceRecord(recordId, { status, notes });
    },

    // Optimistic update - instantly update UI before server responds
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: LESSONS_QUERY_KEY });

      // Snapshot previous value
      const previousHistory = queryClient.getQueryData(LESSONS_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData(
        LESSONS_QUERY_KEY,
        (old: any) => {
          // Validate cache structure - if corrupted, don't update
          if (!old || typeof old !== 'object' || Array.isArray(old) || !old.history || !Array.isArray(old.history)) {
            console.warn('[useEditAttendance] Skipping optimistic update - invalid cache structure');
            return old;
          }

          return {
            ...old,
            history: old.history.map((group: LessonGroup) => ({
              ...group,
              serviceTimes: group.serviceTimes.map(serviceTime => ({
                ...serviceTime,
                records: serviceTime.records.map(record =>
                  record.id === variables.recordId
                    ? {
                        ...record,
                        status: variables.status,
                        notes: variables.notes ?? null,
                      }
                    : record
                ),
                stats: calculateStats(
                  serviceTime.records.map(record =>
                    record.id === variables.recordId
                      ? { ...record, status: variables.status }
                      : record
                  )
                ),
              })),
            })),
          };
        }
      );

      // Return rollback context
      return { previousHistory };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(LESSONS_QUERY_KEY, context.previousHistory);
      }
    },

    // Always refetch after success or error
    onSettled: async () => {
      // Invalidate all related queries to ensure fresh data everywhere
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['today-attendance'] }),
        queryClient.invalidateQueries({ queryKey: ['attendance-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['absence-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['student-attendance'] }),
      ]);
    },
  });

  return {
    editAttendance: editMutation.mutateAsync,
    isEditing: editMutation.isPending,
    editError: editMutation.error,
  };
}

/**
 * Hook to handle adding a new attendance record
 * Includes optimistic updates for instant UI feedback
 */
export function useAddAttendance() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async ({
      studentId,
      scheduleId,
      status,
      serviceTimeId,
      notes,
    }: {
      studentId: number;
      scheduleId: number;
      status: 'present' | 'absent' | 'excused' | 'late';
      serviceTimeId?: number;
      notes?: string;
    }) => {
      return createAttendanceRecord({
        student_id: studentId,
        schedule_id: scheduleId,
        status,
        service_time_id: serviceTimeId,
        notes,
      });
    },

    // Optimistic update - instantly add to UI before server responds
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: LESSONS_QUERY_KEY });

      // Snapshot previous value
      const previousHistory = queryClient.getQueryData(LESSONS_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData(
        LESSONS_QUERY_KEY,
        (old: any) => {
          // Validate cache structure - if corrupted, don't update
          if (!old || typeof old !== 'object' || Array.isArray(old) || !old.history || !Array.isArray(old.history)) {
            console.warn('[useAddAttendance] Skipping optimistic update - invalid cache structure');
            return old;
          }

          return {
            ...old,
            history: old.history.map((group: LessonGroup) => ({
              ...group,
              serviceTimes: group.serviceTimes.map(serviceTime => {
                if (serviceTime.schedule.id !== variables.scheduleId) return serviceTime;

                // Create temporary optimistic record
                const optimisticRecord: AttendanceRecordWithRelations = {
                  id: Date.now(), // Temporary ID
                  student_id: variables.studentId,
                  schedule_id: variables.scheduleId,
                  status: variables.status,
                  service_time_id: variables.serviceTimeId || null,
                  notes: variables.notes || null,
                  marked_by: null,
                  marked_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  student: undefined, // Will be populated on server response
                  schedule: serviceTime.schedule,
                };

                const newRecords = [...serviceTime.records, optimisticRecord];

                return {
                  ...serviceTime,
                  records: newRecords,
                  stats: calculateStats(newRecords),
                };
              }),
            })),
          };
        }
      );

      // Return rollback context
      return { previousHistory };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(LESSONS_QUERY_KEY, context.previousHistory);
      }
    },

    // Always refetch after success or error
    onSettled: async () => {
      // Invalidate all related queries to ensure fresh data everywhere
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['today-attendance'] }),
        queryClient.invalidateQueries({ queryKey: ['attendance-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['absence-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['student-attendance'] }),
      ]);
    },
  });

  return {
    addAttendance: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addError: addMutation.error,
  };
}

/**
 * Hook to handle deleting an attendance record
 * Includes optimistic updates for instant UI feedback
 */
export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ recordId }: { recordId: number }) => {
      return deleteAttendanceRecord(recordId);
    },

    // Optimistic update - instantly remove from UI before server responds
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: LESSONS_QUERY_KEY });

      // Snapshot previous value
      const previousHistory = queryClient.getQueryData(LESSONS_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData(
        LESSONS_QUERY_KEY,
        (old: any) => {
          // Validate cache structure - if corrupted, don't update
          if (!old || typeof old !== 'object' || Array.isArray(old) || !old.history || !Array.isArray(old.history)) {
            console.warn('[useDeleteAttendance] Skipping optimistic update - invalid cache structure');
            return old;
          }

          return {
            ...old,
            history: old.history.map((group: LessonGroup) => ({
              ...group,
              serviceTimes: group.serviceTimes.map(serviceTime => {
                const newRecords = serviceTime.records.filter(record => record.id !== variables.recordId);

                return {
                  ...serviceTime,
                  records: newRecords,
                  stats: calculateStats(newRecords),
                };
              }),
            })),
          };
        }
      );

      // Return rollback context
      return { previousHistory };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(LESSONS_QUERY_KEY, context.previousHistory);
      }
    },

    // Always refetch after success or error
    onSettled: async () => {
      // Invalidate all related queries to ensure fresh data everywhere
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['today-attendance'] }),
        queryClient.invalidateQueries({ queryKey: ['attendance-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['absence-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['student-attendance'] }),
      ]);
    },
  });

  return {
    deleteAttendance: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
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
