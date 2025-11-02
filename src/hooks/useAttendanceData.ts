import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, bulkUpdateAttendance } from '../api/attendance';
import type { StudentWithId, ServiceTime } from '../schemas/attendance.schema';
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
  const allSundays = useMemo(() => {
    return data ? data.dates.map((d) => new Date(d)) : [];
  }, [data]);

  const lessonNames = useMemo(() => {
    return data ? data.lessonNames : {};
  }, [data]);

  const lessonLinks = useMemo(() => {
    return data ? data.lessonLinks : {};
  }, [data]);

  const students = useMemo<StudentWithId[]>(() => {
    return data
      ? data.students
          .map((s) => ({ id: s.id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [data]);

  const serviceTimes = useMemo<ServiceTime[]>(() => {
    return data ? data.serviceTimes : [];
  }, [data]);

  return {
    // Raw data
    data,

    // Derived data
    allSundays,
    lessonNames,
    lessonLinks,
    students,
    serviceTimes,

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
