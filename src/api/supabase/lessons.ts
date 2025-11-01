/**
 * Supabase API - Lessons
 * Operations for lessons table
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type { Lesson, LessonInsert } from '../../types/database.types';

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
 * Get lesson by name (useful for migration)
 */
export async function getLessonByName(name: string): Promise<Lesson | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}
