/**
 * Supabase API - Lessons
 * CRUD operations for lessons table
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type { Lesson, LessonInsert, LessonUpdate } from '../../types/database.types';

/**
 * Get all lessons
 */
export async function getAllLessons(): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('curriculum_series', { ascending: true })
      .order('lesson_number', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get lesson by ID
 */
export async function getLessonById(id: number): Promise<Lesson | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Create a new lesson
 */
export async function createLesson(lesson: LessonInsert): Promise<Lesson> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lesson)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Update a lesson
 */
export async function updateLesson(id: number, updates: LessonUpdate): Promise<Lesson> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
}
