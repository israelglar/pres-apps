/**
 * Supabase API - Students
 * CRUD operations for students table
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type { Student, StudentInsert, StudentUpdate } from '../../types/database.types';

/**
 * Get all active students
 */
export async function getActiveStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get student by ID
 */
export async function getStudentById(id: number): Promise<Student | null> {
  try {
    const { data, error } = await supabase
      .from('students')
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
 * Create a new student
 */
export async function createStudent(student: StudentInsert): Promise<Student> {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Update a student
 */
export async function updateStudent(id: number, updates: StudentUpdate): Promise<Student> {
  try {
    const { data, error } = await supabase
      .from('students')
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
 * Soft delete a student (mark as inactive)
 */
export async function deleteStudent(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('students')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Add a visitor (quick add during attendance)
 */
export async function addVisitor(name: string): Promise<Student> {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        name,
        is_visitor: true,
        visitor_date: new Date().toISOString().split('T')[0],
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}
