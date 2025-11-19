/**
 * Supabase API - Schedules
 * Operations for schedules and schedule_assignments tables
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type {
  Schedule,
  ScheduleWithRelations,
  ScheduleInsert,
} from '../../types/database.types';

/**
 * Get all schedules with related data (lessons, service times, teachers, attendance records)
 */
export async function getAllSchedules(): Promise<ScheduleWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        lesson:lessons(*),
        service_time:service_times(*),
        assignments:schedule_assignments(
          *,
          teacher:teachers(*)
        ),
        attendance_records(
          *,
          student:students(*)
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    // Transform data to compute has_attendance and attendance_count
    const transformedData = (data || []).map((schedule) => {
      const attendanceRecords = schedule.attendance_records || [];
      const attendanceCount = attendanceRecords.length;

      return {
        ...schedule,
        has_attendance: attendanceCount > 0,
        attendance_count: attendanceCount,
      };
    });

    return transformedData;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get schedule by date and service time
 */
export async function getScheduleByDateAndService(
  date: string,
  serviceTimeId: number
): Promise<ScheduleWithRelations | null> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        lesson:lessons(*),
        service_time:service_times(*),
        assignments:schedule_assignments(
          *,
          teacher:teachers(*)
        ),
        attendance_records(
          *,
          student:students(*)
        )
      `)
      .eq('date', date)
      .eq('service_time_id', serviceTimeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    // Transform data to compute has_attendance and attendance_count
    if (data) {
      const attendanceRecords = data.attendance_records || [];
      const attendanceCount = attendanceRecords.length;

      return {
        ...data,
        has_attendance: attendanceCount > 0,
        attendance_count: attendanceCount,
      };
    }

    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get schedule by date (any service time)
 */
export async function getScheduleByDate(date: string): Promise<ScheduleWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        lesson:lessons(*),
        service_time:service_times(*),
        assignments:schedule_assignments(
          *,
          teacher:teachers(*)
        ),
        attendance_records(
          *,
          student:students(*)
        )
      `)
      .eq('date', date)
      .order('service_time_id', { ascending: true });

    if (error) throw error;

    // Transform data to compute has_attendance and attendance_count
    const transformedData = (data || []).map((schedule) => {
      const attendanceRecords = schedule.attendance_records || [];
      const attendanceCount = attendanceRecords.length;

      return {
        ...schedule,
        has_attendance: attendanceCount > 0,
        attendance_count: attendanceCount,
      };
    });

    return transformedData;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get all schedules for a specific lesson
 */
export async function getSchedulesByLessonId(lessonId: number): Promise<ScheduleWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        lesson:lessons(*),
        service_time:service_times(*),
        assignments:schedule_assignments(
          *,
          teacher:teachers(*)
        ),
        attendance_records(
          *,
          student:students(*)
        )
      `)
      .eq('lesson_id', lessonId)
      .order('date', { ascending: false })
      .order('service_time_id', { ascending: true });

    if (error) throw error;

    // Transform data to compute has_attendance and attendance_count
    const transformedData = (data || []).map((schedule) => {
      const attendanceRecords = schedule.attendance_records || [];
      const attendanceCount = attendanceRecords.length;

      return {
        ...schedule,
        has_attendance: attendanceCount > 0,
        attendance_count: attendanceCount,
      };
    });

    return transformedData;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Check if a schedule already exists for a given date and service time
 * Used to prevent conflicts when editing schedules
 */
export async function checkScheduleConflict(
  date: string,
  serviceTimeId: number,
  excludeScheduleId?: number
): Promise<boolean> {
  try {
    let query = supabase
      .from('schedules')
      .select('id')
      .eq('date', date)
      .eq('service_time_id', serviceTimeId);

    // Exclude current schedule from conflict check (for edits)
    if (excludeScheduleId) {
      query = query.neq('id', excludeScheduleId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Return true if there's a conflict (schedule exists)
    return data && data.length > 0;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Create a new schedule
 */
export async function createSchedule(schedule: ScheduleInsert): Promise<Schedule> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  scheduleId: number,
  updates: Partial<ScheduleInsert>
): Promise<Schedule> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Delete a schedule
 * Note: Cannot delete schedules with attendance records due to foreign key constraint
 */
export async function deleteSchedule(scheduleId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get all unique dates that have schedules
 */
export async function getScheduleDates(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('date')
      .order('date', { ascending: false });

    if (error) throw error;

    // Extract unique dates
    const uniqueDates = [...new Set(data?.map((s) => s.date) || [])];
    return uniqueDates;
  } catch (error) {
    handleSupabaseError(error);
  }
}
