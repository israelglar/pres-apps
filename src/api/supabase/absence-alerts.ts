/**
 * Supabase API - Absence Alerts
 * Functions to calculate and retrieve absence alerts for students
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type { AbsenceAlert } from '../../types/absence-alerts.types';

/**
 * Get students with recent consecutive absences (AGGREGATED BY SUNDAY)
 *
 * Logic: Count consecutive Sundays missed, aggregating all services (9h + 11h).
 * - If student came to ANY service (9h OR 11h) on a Sunday → Present
 * - If student didn't come to ANY service on a Sunday → Absent
 * - Counts consecutive Sundays, not individual schedules
 *
 * Example:
 *   Sunday 01/01: came 9h → PRESENT
 *   Sunday 08/01: came 11h → PRESENT
 *   Sunday 15/01: missed both 9h and 11h → ABSENT (1 consecutive absence)
 *
 * @param studentIds - Array of student IDs to check
 * @param threshold - Number of consecutive Sundays absent to trigger alert (default: 3)
 * @param lookbackSundays - Number of recent Sundays to analyze (default: 15)
 * @param currentDateToExclude - Current date being marked (ISO format) to exclude from count
 * @returns Array of absence alerts
 */
export async function getStudentsWithRecentAbsences(
  studentIds: number[],
  threshold: number = 3,
  lookbackSundays: number = 15,
  currentDateToExclude?: string
): Promise<AbsenceAlert[]> {
  try {
    console.log('[ABSENCE ALERTS] Starting calculation', {
      studentIdsCount: studentIds.length,
      threshold,
      lookbackSundays,
      currentDateToExclude,
    });

    if (studentIds.length === 0) {
      console.log('[ABSENCE ALERTS] No student IDs provided, returning empty');
      return [];
    }

    // 1. Get recent schedules to extract unique dates (Sundays)
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('date')
      .eq('is_cancelled', false)
      .order('date', { ascending: false });

    if (schedulesError) throw schedulesError;
    if (!schedules || schedules.length === 0) {
      console.log('[ABSENCE ALERTS] No schedules found');
      return [];
    }

    // Deduplicate dates (one Sunday can have 9h + 11h schedules)
    const allDates = schedules.map(s => s.date);
    let uniqueDates = [...new Set(allDates)];

    console.log('[ABSENCE ALERTS] Schedules loaded', {
      totalSchedules: schedules.length,
      allDatesCount: allDates.length,
      uniqueDatesCount: uniqueDates.length,
      uniqueDates: uniqueDates.slice(0, 5), // Show first 5
    });

    // Exclude current date and future dates (to only count PAST absences)
    // Always filter out future dates - use current date if not provided
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filterDate = currentDateToExclude || today;

    const beforeFilter = uniqueDates.length;
    uniqueDates = uniqueDates.filter(date => date < filterDate);
    console.log('[ABSENCE ALERTS] Filtered out current/future dates', {
      filterDate,
      today,
      currentDateToExclude,
      beforeFilter,
      afterFilter: uniqueDates.length,
      excluded: beforeFilter - uniqueDates.length,
      remainingDates: uniqueDates.slice(0, 5),
    });

    uniqueDates = uniqueDates.slice(0, lookbackSundays);
    console.log('[ABSENCE ALERTS] Limited to lookback window', {
      lookbackSundays,
      uniqueDatesCount: uniqueDates.length,
    });

    if (uniqueDates.length === 0) {
      console.log('[ABSENCE ALERTS] No dates in range, returning empty');
      return [];
    }

    const oldestDate = uniqueDates[uniqueDates.length - 1];
    const newestDate = uniqueDates[0];
    console.log('[ABSENCE ALERTS] Date range', { oldestDate, newestDate });

    // 2. Get attendance records for these students, with date from schedules
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select(`
        student_id,
        status,
        schedule:schedules!inner(date)
      `)
      .in('student_id', studentIds)
      .gte('schedules.date', oldestDate)
      .lte('schedules.date', newestDate);

    if (attendanceError) throw attendanceError;

    console.log('[ABSENCE ALERTS] Attendance records loaded', {
      recordsCount: attendanceRecords?.length || 0,
      sampleRecords: attendanceRecords?.slice(0, 3).map(r => ({
        student_id: r.student_id,
        status: r.status,
        date: (r as any).schedule.date,
      })),
    });

    // 3. Build a map of presence by student and date
    // If student came to ANY service on that date → Add to Set
    // Status 'present', 'late', 'excused' count as present
    // Only 'absent' counts as absent
    const presenceByStudentAndDate = new Map<number, Set<string>>();

    attendanceRecords?.forEach((record: any) => {
      const date = record.schedule.date;

      // If student was present/late/excused in ANY service → count as present for that Sunday
      if (record.status !== 'absent') {
        if (!presenceByStudentAndDate.has(record.student_id)) {
          presenceByStudentAndDate.set(record.student_id, new Set());
        }
        presenceByStudentAndDate.get(record.student_id)!.add(date);
      }
    });

    console.log('[ABSENCE ALERTS] Presence map built', {
      studentsWithRecords: presenceByStudentAndDate.size,
      samplePresence: Array.from(presenceByStudentAndDate.entries()).slice(0, 2).map(([id, dates]) => ({
        studentId: id,
        presentDatesCount: dates.size,
        presentDates: Array.from(dates).slice(0, 3),
      })),
    });

    // 4. Calculate consecutive absences by Sunday for each student
    const alerts: AbsenceAlert[] = [];

    for (const studentId of studentIds) {
      const studentPresenceDates = presenceByStudentAndDate.get(studentId) || new Set();

      console.log(`[ABSENCE ALERTS] Checking student ${studentId}`, {
        presentDatesCount: studentPresenceDates.size,
        presentDates: Array.from(studentPresenceDates),
      });

      let consecutiveAbsences = 0;
      const absenceDates: string[] = [];
      let firstAbsenceDate: string | null = null;
      let lastAbsenceDate: string | null = null;

      // Iterate through Sundays from most recent to oldest
      for (const date of uniqueDates) {
        const wasPresentOnThisSunday = studentPresenceDates.has(date);

        console.log(`[ABSENCE ALERTS] Student ${studentId} on ${date}:`, {
          wasPresentOnThisSunday,
          consecutiveAbsences,
        });

        if (!wasPresentOnThisSunday) {
          // Absent on this Sunday (didn't come to ANY service)
          consecutiveAbsences++;
          absenceDates.push(date);

          if (!firstAbsenceDate) {
            firstAbsenceDate = date;
          }
          lastAbsenceDate = date;
        } else {
          // Present on this Sunday (came to at least one service) → stop counting
          console.log(`[ABSENCE ALERTS] Student ${studentId} was present on ${date}, stopping count`);
          break;
        }
      }

      // If threshold met, create alert
      if (consecutiveAbsences >= threshold && firstAbsenceDate && lastAbsenceDate) {
        console.log(`[ABSENCE ALERTS] ALERT TRIGGERED for student ${studentId}`, {
          consecutiveAbsences,
          threshold,
          absenceDates,
        });
        alerts.push({
          studentId,
          absenceCount: consecutiveAbsences,
          absenceDates: absenceDates.reverse(), // Oldest to newest
          firstAbsenceDate: lastAbsenceDate, // lastAbsenceDate is the oldest (we iterated DESC)
          lastAbsenceDate: firstAbsenceDate, // firstAbsenceDate is the newest
        });
      } else {
        console.log(`[ABSENCE ALERTS] No alert for student ${studentId}`, {
          consecutiveAbsences,
          threshold,
          meetsThreshold: consecutiveAbsences >= threshold,
        });
      }
    }

    console.log('[ABSENCE ALERTS] Final result', {
      totalAlerts: alerts.length,
      alertedStudentIds: alerts.map(a => a.studentId),
    });

    return alerts;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Get absence alerts for all active students
 * This is a convenience function that fetches all active students and calculates alerts
 *
 * @param threshold - Number of consecutive absences to trigger alert (default: 3)
 * @param currentDateToExclude - Current date being marked (ISO format) to exclude from count
 * @returns Array of absence alerts
 */
export async function getAbsenceAlertsForSchedule(
  threshold: number = 3,
  currentDateToExclude?: string
): Promise<AbsenceAlert[]> {
  try {
    // Get all active students (we'll check all of them)
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('status', 'active')
      .eq('is_visitor', false); // Don't alert for visitors

    if (studentsError) throw studentsError;
    if (!students || students.length === 0) return [];

    const studentIds = students.map((s) => s.id);

    // Calculate alerts for these students
    return await getStudentsWithRecentAbsences(studentIds, threshold, 15, currentDateToExclude);
  } catch (error) {
    handleSupabaseError(error);
  }
}
