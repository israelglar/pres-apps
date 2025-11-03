/**
 * Attendance API
 * Main API layer for attendance operations
 *
 * STATUS: ✅ ACTIVE - Uses Supabase PostgreSQL
 *
 * This file has been migrated from Google Sheets to Supabase.
 * It wraps Supabase API calls from src/api/supabase/ with the
 * original AttendanceData schema for backwards compatibility.
 *
 * NOTE: The old Google Sheets integration was removed during the
 * Supabase migration (2025-11-03).
 */

import {
  attendanceDataSchema,
  type AttendanceData,
  type Student,
  type Schedule,
} from "../schemas/attendance.schema";
import { getActiveStudents } from "./supabase/students";
import { getAllSchedules, getScheduleDates, getScheduleByDateAndService, createSchedule } from "./supabase/schedules";
import { bulkSaveAttendance as supabaseBulkSave } from "./supabase/attendance";
import { getActiveServiceTimes } from "./supabase/service-times";
import type { ScheduleWithRelations } from "../types/database.types";

/**
 * Transform Supabase schedule to frontend schema
 */
function transformSchedule(schedule: ScheduleWithRelations): Schedule {
  // Count attendance records
  const attendanceCount = Array.isArray(schedule.attendance_records)
    ? schedule.attendance_records.length
    : 0;

  return {
    id: schedule.id,
    date: schedule.date,
    service_time_id: schedule.service_time_id,
    lesson_id: schedule.lesson_id,
    event_type: schedule.event_type,
    is_cancelled: schedule.is_cancelled,
    lesson: schedule.lesson ? {
      id: schedule.lesson.id,
      name: schedule.lesson.name,
      resource_url: schedule.lesson.resource_url,
      curriculum_series: schedule.lesson.curriculum_series,
      lesson_number: schedule.lesson.lesson_number,
      is_special_event: schedule.lesson.is_special_event,
    } : undefined,
    service_time: schedule.service_time ? {
      id: schedule.service_time.id,
      time: schedule.service_time.time,
      name: schedule.service_time.name,
      is_active: schedule.service_time.is_active,
      display_order: schedule.service_time.display_order,
    } : undefined,
    attendance_count: attendanceCount,
    has_attendance: attendanceCount > 0,
  };
}

/**
 * Get all attendance data
 * This is the main function used by the frontend to load all necessary data
 */
export async function getAttendance(): Promise<AttendanceData> {
  console.log("Fetching attendance data from Supabase...");
  try {
    // Fetch all necessary data in parallel
    const [students, schedules, dates, serviceTimes] = await Promise.all([
      getActiveStudents(),
      getAllSchedules(),
      getScheduleDates(),
      getActiveServiceTimes(),
    ]);

    // Transform students to match expected schema
    const transformedStudents: Student[] = students.map((s) => ({
      id: s.id,
      name: s.name,
      is_visitor: s.is_visitor,
    }));

    // Transform schedules to match expected schema
    const transformedSchedules: Schedule[] = schedules.map(transformSchedule);

    // Build response matching the expected schema
    const response: AttendanceData = {
      success: true,
      dates,
      schedules: transformedSchedules,
      students: transformedStudents,
      serviceTimes,
    };

    // Validate response with Zod
    const validatedData = attendanceDataSchema.parse(response);

    console.log("✅ Attendance data fetched successfully from Supabase");
    return validatedData;
  } catch (error) {
    console.error("❌ Error fetching attendance data:", error);
    if (!navigator.onLine) {
      throw new Error("No internet connection. Please check your network.");
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch attendance data. Please try again."
    );
  }
}

/**
 * Bulk save attendance records
 * @param date - ISO date string (YYYY-MM-DD)
 * @param serviceTimeId - Service time ID (1 = 9h, 2 = 11h)
 * @param records - Array of attendance records
 */
export async function bulkUpdateAttendance(
  date: string,
  serviceTimeId: number,
  records: Array<{
    student_id: number;
    status: 'present' | 'absent' | 'excused' | 'late';
    notes?: string;
  }>
) {
  try {
    console.log(`Saving attendance for ${date}, service time ${serviceTimeId}...`);

    // First, find or create the schedule for this date/service time
    // Use the dedicated function to check for existing schedule
    let schedule = await getScheduleByDateAndService(date, serviceTimeId);

    // If schedule doesn't exist, create it
    if (!schedule) {
      console.log("Schedule not found, creating new schedule...");
      try {
        schedule = await createSchedule({
          date,
          service_time_id: serviceTimeId,
          lesson_id: null,
          event_type: 'regular',
          is_cancelled: false,
          notes: null,
        });
      } catch (createError: any) {
        // Handle race condition: another request may have just created the schedule
        if (createError?.message?.includes('duplicate key') ||
            createError?.code === '23505') {
          console.log("Schedule was created by another request, fetching it...");
          schedule = await getScheduleByDateAndService(date, serviceTimeId);
          if (!schedule) {
            throw new Error("Failed to retrieve schedule after duplicate error");
          }
        } else {
          throw createError;
        }
      }
    }

    // Save attendance records with service_time_id
    const recordsWithServiceTime = records.map(record => ({
      ...record,
      service_time_id: serviceTimeId,
    }));

    const savedRecords = await supabaseBulkSave(schedule.id, recordsWithServiceTime);

    console.log(`✅ Saved ${savedRecords.length} attendance records`);
    return { success: true, count: savedRecords.length };
  } catch (error) {
    console.error("❌ Error saving attendance:", error);
    if (!navigator.onLine) {
      throw new Error("No internet connection. Please check your network.");
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to save attendance. Please try again."
    );
  }
}
