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
 * Get attendance statistics for a date range
 */
export async function getAttendanceStats(startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        status,
        schedule:schedules!inner(date)
      `)
      .gte('schedules.date', startDate)
      .lte('schedules.date', endDate);

    if (error) throw error;

    // Calculate statistics
    const present = data?.filter((r) => r.status === 'present').length || 0;
    const absent = data?.filter((r) => r.status === 'absent').length || 0;
    const total = data?.length || 0;

    return {
      present,
      absent,
      total,
      attendanceRate: total > 0 ? (present / total) * 100 : 0,
    };
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get students who have been absent for N or more consecutive lessons
 */
export async function getStudentsWithConsecutiveAbsences(
  consecutiveCount: number = 3
): Promise<Array<{ student_id: number; student_name: string; absence_count: number }>> {
  try {
    // This is a complex query that would be better done with a database function
    // For now, we'll fetch recent attendance and process in JS
    const { data: schedules } = await supabase
      .from('schedules')
      .select('id, date')
      .eq('is_cancelled', false)
      .order('date', { ascending: false })
      .limit(10);

    if (!schedules) return [];

    const scheduleIds = schedules.map((s) => s.id);

    const { data: attendance }: any = await supabase
      .from('attendance_records')
      .select('student_id, schedule_id, status, student:students(name)')
      .in('schedule_id', scheduleIds)
      .order('schedule_id', { ascending: false });

    if (!attendance) return [];

    // Group by student and count consecutive absences
    const studentAbsences: Record<number, { name: string; consecutiveAbsences: number }> = {};

    attendance.forEach((record: any) => {
      if (!studentAbsences[record.student_id]) {
        studentAbsences[record.student_id] = {
          name: record.student?.name || 'Unknown',
          consecutiveAbsences: 0,
        };
      }

      if (record.status === 'absent') {
        studentAbsences[record.student_id].consecutiveAbsences++;
      } else {
        // Reset count if present
        studentAbsences[record.student_id].consecutiveAbsences = 0;
      }
    });

    // Filter students with consecutive absences >= threshold
    return Object.entries(studentAbsences)
      .filter(([, data]) => data.consecutiveAbsences >= consecutiveCount)
      .map(([studentId, data]) => ({
        student_id: parseInt(studentId),
        student_name: data.name,
        absence_count: data.consecutiveAbsences,
      }));
  } catch (error) {
    handleSupabaseError(error);
  }
}
