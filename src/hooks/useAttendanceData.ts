import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, bulkUpdateAttendance } from '../api/attendance';
import type { ServiceTime, Schedule } from '../schemas/attendance.schema';
import { useMemo } from 'react';

/**
 * Query key for attendance data
 */
export const ATTENDANCE_QUERY_KEY = ['attendance'] as const;

/**
 * Custom hook to fetch and manage attendance data using TanStack Query
 *
 * Features:
 * - Automatic caching (60 minutes)
 * - Background refetching
 * - Retry logic
 * - Optimistic updates
 * - Loading and error states
 *
 * @returns Attendance data, derived data, loading/error states, and mutation functions
 */
export function useAttendanceData() {
  const queryClient = useQueryClient();

  // Fetch attendance data
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ATTENDANCE_QUERY_KEY,
    queryFn: getAttendance,
    staleTime: 55 * 60 * 1000, // 55 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 3,
  });

  // Mutation for saving attendance
  const saveMutation = useMutation({
    mutationFn: ({
      date,
      serviceTimeId,
      records,
    }: {
      date: string;
      serviceTimeId: number;
      records: Array<{
        student_id: number;
        status: 'present' | 'absent' | 'excused' | 'late';
        notes?: string;
      }>;
    }) => bulkUpdateAttendance(date, serviceTimeId, records),
    onSuccess: () => {
      // Invalidate and refetch attendance data after successful save
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
    },
  });

  // Derived data - memoized to prevent unnecessary recalculations
  const schedules = useMemo<Schedule[]>(() => {
    return data ? data.schedules : [];
  }, [data]);

  const allSundays = useMemo(() => {
    return data ? data.dates.map((d) => new Date(d)) : [];
  }, [data]);

  const students = useMemo(() => {
    return data
      ? data.students
          .filter((s) => !s.is_visitor) // ONLY regular students
          .map((s) => ({ id: s.id, name: s.name, is_visitor: false }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [data]);

  const visitorStudents = useMemo(() => {
    return data
      ? data.students
          .filter((s) => s.is_visitor) // ONLY visitors
          .map((s) => ({ id: s.id, name: s.name, is_visitor: true }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [data]);

  const serviceTimes = useMemo<ServiceTime[]>(() => {
    return data ? data.serviceTimes : [];
  }, [data]);

  // Helper function to get a schedule for a specific date and service time
  const getSchedule = useMemo(() => {
    return (date: string, serviceTimeId: number | null): Schedule | undefined => {
      if (!data) return undefined;
      return data.schedules.find(
        (s) => s.date === date && s.service_time_id === serviceTimeId
      );
    };
  }, [data]);

  // Helper function to get all dates available for a specific service time
  const getAvailableDates = useMemo(() => {
    return (serviceTimeId?: number | null): Date[] => {
      if (!data) return [];

      // If no service time specified, return all dates
      if (serviceTimeId === undefined || serviceTimeId === null) {
        return data.dates.map((d) => new Date(d));
      }

      // Filter schedules by service time and extract unique dates
      const datesForService = data.schedules
        .filter((s) => s.service_time_id === serviceTimeId)
        .map((s) => s.date);

      const uniqueDates = [...new Set(datesForService)];
      return uniqueDates.map((d) => new Date(d));
    };
  }, [data]);

  // Backward compatibility: Generate lessonNames map from schedules
  // This creates a simplified map that picks the first lesson for each date
  // Note: This is a temporary helper - components should eventually use getSchedule() with serviceTimeId
  const lessonNames = useMemo(() => {
    if (!data) return {};

    const names: Record<string, string> = {};
    data.schedules.forEach((schedule) => {
      if (schedule.lesson && !names[schedule.date]) {
        names[schedule.date] = schedule.lesson.name;
      }
    });
    return names;
  }, [data]);

  return {
    // Raw data
    data,

    // Derived data
    schedules,
    allSundays,
    students,
    visitorStudents,
    serviceTimes,
    lessonNames, // Backward compatibility - should be removed once components are updated

    // Helper functions
    getSchedule,
    getAvailableDates,

    // States
    isLoading,
    isRefreshing: isFetching && !isLoading,
    isDataReady: !!data && !error,
    error: error ? (error as Error).message : null,

    // Actions
    refetch,
    saveAttendance: saveMutation.mutateAsync,

    // Save states
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error ? (saveMutation.error as Error).message : null,
  };
}

/**
 * Hook to handle attendance completion flow
 * Transforms records and triggers save mutation
 */
export function useAttendanceSubmit() {
  const { saveAttendance, isSaving, saveError } = useAttendanceData();

  const handleComplete = async (
    records: Array<{ studentId: number; status: string; notes?: string }>,
    selectedDate: string,
    serviceTimeId: number = 2 // Default to 11h service
  ) => {
    // Transform records to match new API format
    const attendanceRecords = records.map((record) => ({
      student_id: record.studentId,
      status: record.status as 'present' | 'absent' | 'excused' | 'late',
      notes: record.notes,
    }));

    // Call save attendance with properly structured parameters
    await saveAttendance({
      date: selectedDate,
      serviceTimeId,
      records: attendanceRecords,
    });

    // Wait a moment to show success message
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return {
    handleComplete,
    isSaving,
    saveError,
  };
}
