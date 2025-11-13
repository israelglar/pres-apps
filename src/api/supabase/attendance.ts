/**
 * Supabase API - Attendance
 * Operations for attendance_records table
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type {
  AttendanceRecord,
  AttendanceRecordInsert,
  AttendanceRecordWithRelations,
} from '../../types/database.types';

/**
 * Get attendance records for a specific schedule
 */
export async function getAttendanceBySchedule(
  scheduleId: number
): Promise<AttendanceRecordWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(*),
        schedule:schedules(
          *,
          lesson:lessons(*),
          service_time:service_times(*)
        )
      `)
      .eq('schedule_id', scheduleId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get attendance records for a specific student
 */
export async function getAttendanceByStudent(
  studentId: number
): Promise<AttendanceRecordWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(*),
        schedule:schedules(
          *,
          lesson:lessons(*),
          service_time:service_times(*)
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Bulk save attendance records for a schedule
 * This is the main function used by the attendance marking interface
 */
export async function bulkSaveAttendance(
  scheduleId: number,
  records: Array<{
    student_id: number;
    status: 'present' | 'absent' | 'excused' | 'late';
    service_time_id?: number;
    notes?: string;
  }>
): Promise<AttendanceRecord[]> {
  try {
    // Prepare records with schedule_id and timestamp
    const recordsToInsert: AttendanceRecordInsert[] = records.map((record) => ({
      schedule_id: scheduleId,
      student_id: record.student_id,
      status: record.status,
      service_time_id: record.service_time_id || null,
      notes: record.notes || null,
      marked_by: null, // TODO: Add teacher ID when auth is implemented
      marked_at: new Date().toISOString(),
    }));

    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(recordsToInsert, {
        onConflict: 'student_id,schedule_id',
      })
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Update a single attendance record
 */
export async function updateAttendanceRecord(
  id: number,
  updates: {
    status?: 'present' | 'absent' | 'excused' | 'late';
    notes?: string;
  }
): Promise<AttendanceRecord> {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
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
 * Create a single attendance record
 * Used when adding a student to past attendance in history view
 */
export async function createAttendanceRecord(record: {
  student_id: number;
  schedule_id: number;
  status: 'present' | 'absent' | 'excused' | 'late';
  service_time_id?: number;
  notes?: string;
}): Promise<AttendanceRecordWithRelations> {
  try {
    const recordToInsert: AttendanceRecordInsert = {
      schedule_id: record.schedule_id,
      student_id: record.student_id,
      status: record.status,
      service_time_id: record.service_time_id || null,
      notes: record.notes || null,
      marked_by: null, // TODO: Add teacher ID when auth is implemented
      marked_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('attendance_records')
      .insert(recordToInsert)
      .select(`
        *,
        student:students(*),
        schedule:schedules(
          *,
          lesson:lessons(*),
          service_time:service_times(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Delete a single attendance record
 * Used when removing a student from past attendance in history view
 */
export async function deleteAttendanceRecord(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
}

