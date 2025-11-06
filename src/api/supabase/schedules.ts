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
  console.log('[Schedules API] getAllSchedules called');
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

    console.log('[Schedules API] getAllSchedules result:', {
      count: data?.length || 0,
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Schedules API] getAllSchedules error:', error);
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
  console.log('[Schedules API] getScheduleByDateAndService called:', { date, serviceTimeId });
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

    console.log('[Schedules API] getScheduleByDateAndService result:', {
      hasData: !!data,
      scheduleId: data?.id,
      lessonTitle: data?.lesson?.title,
      hasError: !!error,
      errorCode: error?.code,
    });

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('[Schedules API] getScheduleByDateAndService error:', error);
    handleSupabaseError(error);
  }
}

/**
 * Get schedule by date (any service time)
 */
export async function getScheduleByDate(date: string): Promise<ScheduleWithRelations[]> {
  console.log('[Schedules API] getScheduleByDate called:', { date });
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

    console.log('[Schedules API] getScheduleByDate result:', {
      count: data?.length || 0,
      hasError: !!error,
      errorCode: error?.code,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Schedules API] getScheduleByDate error:', error);
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
 * Get upcoming schedules (not cancelled, future dates)
 */
export async function getUpcomingSchedules(limit: number = 5): Promise<ScheduleWithRelations[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

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
      .eq('is_cancelled', false)
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
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
