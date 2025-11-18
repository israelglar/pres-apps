/**
 * Custom hook for lesson management operations
 * Wraps Supabase API with TanStack Query for data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../api/supabase/lessons';
import type { LessonInsert, LessonUpdate } from '../types/database.types';
import { queryKeys } from '../lib/queryKeys';

/**
 * Fetch all lessons from catalog
 */
export function useLessons() {
  return useQuery({
    queryKey: queryKeys.lessonCatalog(),
    queryFn: () => getAllLessons(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

/**
 * Create a new lesson
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lesson: LessonInsert) => createLesson(lesson),
    onSuccess: () => {
      // Invalidate lesson catalog queries
      queryClient.invalidateQueries({ queryKey: ['lesson-catalog'] });
    },
  });
}

/**
 * Update an existing lesson
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: LessonUpdate }) =>
      updateLesson(id, updates),
    onSuccess: () => {
      // Invalidate lesson catalog queries
      queryClient.invalidateQueries({ queryKey: ['lesson-catalog'] });
    },
  });
}

/**
 * Delete a lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLesson(id),
    onSuccess: () => {
      // Invalidate lesson catalog queries
      queryClient.invalidateQueries({ queryKey: ['lesson-catalog'] });
    },
  });
}

/**
 * Combined hook for all lesson management operations
 */
export function useLessonManagement() {
  const lessonsQuery = useLessons();
  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();

  return {
    // Query state
    lessons: lessonsQuery.data || [],
    isLoading: lessonsQuery.isLoading,
    isError: lessonsQuery.isError,
    error: lessonsQuery.error,
    refetch: lessonsQuery.refetch,

    // Mutations (use mutateAsync for awaitable promises)
    createLesson: createMutation.mutateAsync,
    updateLesson: updateMutation.mutateAsync,
    deleteLesson: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
