/**
 * Supabase API - Absence Alerts
 * Functions to calculate and retrieve absence alerts for students
 */

import { supabase, handleSupabaseError } from '../../lib/supabase';
import type { AbsenceAlert } from '../../types/absence-alerts.types';
import { ATTENDANCE } from '@/config/constants';

/**
 * Get students with recent consecutive absences (AGGREGATED BY SUNDAY)
 *
 * Logic: Only looks at student's actual attendance records, ignoring unmarked Sundays.
 * - Gets student's attendance records (past dates only)
 * - Groups by date (Sunday) - if present at ANY service → Sunday is "present"
 * - Counts consecutive absences from most recent attendance record backwards
 * - Stops counting when hitting a "present" record
 *
 * Unmarked Sundays are completely ignored - only explicit attendance records matter.
 * This matches the student detail page logic exactly.
 *
 * Example (student's attendance records only):
 *   2025-11-17: Absent → count = 1
 *   2025-10-06: Absent → count = 2
 *   2025-09-29: Absent → count = 3 → ALERT!
 *   2025-09-22: Present → stops counting
 *
 *   (Unmarked Sundays like 2025-11-19, 2025-11-10 are not in the data, so ignored)
 *
 * @param studentIds - Array of student IDs to check
 * @param threshold - Number of consecutive absences to trigger alert (default: 3)
 * @param lookbackSundays - Not used (kept for API compatibility)
 * @param currentDateToExclude - Current date being marked (ISO format) to exclude from count
 * @returns Array of absence alerts
 */
export async function getStudentsWithRecentAbsences(
  studentIds: number[],
  threshold: number = ATTENDANCE.ABSENCE_ALERT_THRESHOLD,
  _lookbackSundays: number = 15,
  currentDateToExclude?: string
): Promise<AbsenceAlert[]> {
  try {
    if (studentIds.length === 0) {
      return [];
    }

    // Filter date: exclude current date being marked and future dates
    const filterDate = currentDateToExclude || new Date().toISOString().split('T')[0];

    // Get attendance records for all students
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select(`
        student_id,
        status,
        schedule:schedules!inner(date)
      `)
      .in('student_id', studentIds)
      .lt('schedules.date', filterDate); // Only past dates

    if (attendanceError) throw attendanceError;
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return [];
    }

    // Sort by date in JavaScript (can't order by joined table field in Supabase)
    attendanceRecords.sort((a: any, b: any) => {
      const dateA = a.schedule?.date || '';
      const dateB = b.schedule?.date || '';
      return dateB.localeCompare(dateA); // Descending order (newest first)
    });

    // Group attendance records by student and date
    // Each student has a map of date -> status ('present' or 'absent')
    const studentRecordsByDate = new Map<number, Map<string, 'present' | 'absent'>>();

    attendanceRecords.forEach((record: any) => {
      const studentId = record.student_id;
      const date = record.schedule.date;
      const status = record.status;

      if (!studentRecordsByDate.has(studentId)) {
        studentRecordsByDate.set(studentId, new Map());
      }

      const dateRecords = studentRecordsByDate.get(studentId)!;

      // If multiple services on same day, 'present' takes priority
      if (!dateRecords.has(date) || status === 'present') {
        dateRecords.set(date, status);
      }
    });

    // Calculate consecutive absences for each student
    const alerts: AbsenceAlert[] = [];

    for (const studentId of studentIds) {
      const records = studentRecordsByDate.get(studentId);

      if (!records || records.size === 0) {
        continue;
      }

      // Sort dates descending (most recent first)
      const sortedDates = Array.from(records.keys()).sort((a, b) => b.localeCompare(a));

      let consecutiveAbsences = 0;
      const absenceDates: string[] = [];
      let firstAbsenceDate: string | null = null;
      let lastAbsenceDate: string | null = null;

      // Count consecutive absences from most recent record
      for (const date of sortedDates) {
        const status = records.get(date)!;

        if (status === 'present') {
          break;
        } else if (status === 'absent') {
          consecutiveAbsences++;
          absenceDates.push(date);

          if (!firstAbsenceDate) {
            firstAbsenceDate = date;
          }
          lastAbsenceDate = date;
        }
      }

      // If threshold met, create alert
      if (consecutiveAbsences >= threshold && firstAbsenceDate && lastAbsenceDate) {
        alerts.push({
          studentId,
          absenceCount: consecutiveAbsences,
          absenceDates: absenceDates.reverse(), // Oldest to newest
          firstAbsenceDate: lastAbsenceDate, // lastAbsenceDate is the oldest
          lastAbsenceDate: firstAbsenceDate, // firstAbsenceDate is the newest
        });
      }
    }

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
  threshold: number = ATTENDANCE.ABSENCE_ALERT_THRESHOLD,
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
