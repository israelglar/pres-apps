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
        attendance_records(id)
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
        attendance_records(id)
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
        attendance_records(id)
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
