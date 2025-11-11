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
    return data || [];
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
        )
      `)
      .eq('date', date)
      .eq('service_time_id', serviceTimeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
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
        )
      `)
      .eq('date', date)
      .order('service_time_id', { ascending: true });

    if (error) throw error;
    return data || [];
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
