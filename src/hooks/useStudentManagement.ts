/**
 * Custom hook for student management operations
 * Wraps Supabase API with TanStack Query for data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ATTENDANCE, QUERY } from '@/config/constants';
import {
  getAllStudents,
  getActiveStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../api/supabase/students';
import { getAbsenceAlertsForSchedule } from '../api/supabase/absence-alerts';
import type { Student, StudentInsert, StudentUpdate } from '../types/database.types';
import { queryKeys } from '../lib/queryKeys';

/**
 * Extended student type with alert information
 */
export interface StudentWithAlert extends Student {
  hasAlert: boolean;
}

/**
 * Fetch students with optional filtering and alert information
 * @param filter - 'all' for all students, 'active' for active students only
 * @param includeAlerts - Whether to include absence alerts (default: false)
 * @param alertThreshold - Number of consecutive absences to trigger alert (default: 3)
 */
export function useStudents(
  filter: 'all' | 'active' = 'all',
  includeAlerts: boolean = false,
  alertThreshold: number = ATTENDANCE.ABSENCE_ALERT_THRESHOLD
) {
  return useQuery({
    queryKey: queryKeys.students(filter, includeAlerts, alertThreshold),
    queryFn: async () => {
      const students = await (filter === 'active' ? getActiveStudents() : getAllStudents());

      // If alerts are not needed, return students as-is
      if (!includeAlerts) {
        return students;
      }

      // Fetch absence alerts
      const alerts = await getAbsenceAlertsForSchedule(alertThreshold);
      const alertMap = new Map(alerts.map(alert => [alert.studentId, true]));

      // Add hasAlert property to each student
      const studentsWithAlerts: StudentWithAlert[] = students.map(student => ({
        ...student,
        hasAlert: alertMap.has(student.id),
      }));

      return studentsWithAlerts;
    },
    staleTime: QUERY.STALE_TIME_SHORT,
    refetchOnMount: true, // Only refetch if stale
  });
}

/**
 * Create a new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (student: StudentInsert) => createStudent(student),
    onSuccess: () => {
      // Invalidate all student queries (prefix match catches all filter variations)
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Update an existing student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: StudentUpdate }) =>
      updateStudent(id, updates),
    onSuccess: () => {
      // Invalidate all student queries (both 'all' and 'active' filters)
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Delete a student (soft delete - marks as inactive)
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: () => {
      // Invalidate all student queries (both 'all' and 'active' filters)
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Combined hook for all student management operations
 */
export function useStudentManagement(
  includeAlerts: true,
  alertThreshold?: number
): {
  students: StudentWithAlert[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  createStudent: (student: StudentInsert) => void;
  updateStudent: (params: { id: number; updates: StudentUpdate }) => void;
  deleteStudent: (id: number) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};
export function useStudentManagement(
  includeAlerts: false,
  alertThreshold?: number
): {
  students: Student[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  createStudent: (student: StudentInsert) => void;
  updateStudent: (params: { id: number; updates: StudentUpdate }) => void;
  deleteStudent: (id: number) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};
export function useStudentManagement(includeAlerts: boolean = true, alertThreshold?: number): any {
  const studentsQuery = useStudents('all', includeAlerts, alertThreshold ?? ATTENDANCE.ABSENCE_ALERT_THRESHOLD);
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  return {
    // Query state
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    isError: studentsQuery.isError,
    error: studentsQuery.error,
    refetch: studentsQuery.refetch,

    // Mutations
    createStudent: createMutation.mutate,
    updateStudent: updateMutation.mutate,
    deleteStudent: deleteMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
