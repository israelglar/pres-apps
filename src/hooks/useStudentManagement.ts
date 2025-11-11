/**
 * Custom hook for student management operations
 * Wraps Supabase API with TanStack Query for data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllStudents,
  getActiveStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../api/supabase/students';
import type { StudentInsert, StudentUpdate } from '../types/database.types';

/**
 * Fetch students with optional filtering
 * @param filter - 'all' for all students, 'active' for active students only
 */
export function useStudents(filter: 'all' | 'active' = 'all') {
  return useQuery({
    queryKey: ['students', filter],
    queryFn: filter === 'active' ? getActiveStudents : getAllStudents,
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
      // Invalidate all student queries (both 'all' and 'active' filters)
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
export function useStudentManagement() {
  const studentsQuery = useStudents();
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
