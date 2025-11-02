/**
 * Custom hook for student management operations
 * Wraps Supabase API with TanStack Query for data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActiveStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../api/supabase/students';
import type { StudentInsert, StudentUpdate } from '../types/database.types';

const STUDENTS_QUERY_KEY = ['students'];

/**
 * Fetch all active students
 */
export function useStudents() {
  return useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: getActiveStudents,
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
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
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
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
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
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
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
