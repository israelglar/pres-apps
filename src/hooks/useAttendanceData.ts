import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, bulkUpdateAttendance } from '../api/attendance';
import type { AttendanceRecord, StudentWithId } from '../schemas/attendance.schema';
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
    mutationFn: bulkUpdateAttendance,
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
          .map((s, id) => ({ id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [data]);

  return {
    // Raw data
    data,

    // Derived data
    allSundays,
    lessonNames,
    lessonLinks,
    students,

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
    records: Array<{ studentName: string; status: string }>,
    selectedDate: string
  ) => {
    // Transform records to match API format
    const attendanceRecords: AttendanceRecord[] = records.map((record) => ({
      name: record.studentName,
      date: new Date(selectedDate),
      status: record.status as any, // Cast to match the enum
    }));

    await saveAttendance(attendanceRecords);

    // Wait a moment to show success message
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return {
    handleComplete,
    isSaving,
    saveError,
  };
}
