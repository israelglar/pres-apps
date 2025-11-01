/**
 * Attendance API
 * Main API layer for attendance operations
 * Now powered by Supabase instead of Google Sheets
 */

import {
  attendanceDataSchema,
  type AttendanceData,
  type Student,
} from "../schemas/attendance.schema";
import { getActiveStudents } from "./supabase/students";
import { getAllSchedules, getScheduleDates } from "./supabase/schedules";
import { bulkSaveAttendance as supabaseBulkSave } from "./supabase/attendance";

/**
 * Get all attendance data
 * This is the main function used by the frontend to load all necessary data
 */
export async function getAttendance(): Promise<AttendanceData> {
  console.log("Fetching attendance data from Supabase...");
  try {
    // Fetch all necessary data in parallel
    const [students, schedules, dates] = await Promise.all([
      getActiveStudents(),
      getAllSchedules(),
      getScheduleDates(),
    ]);

    // Transform schedules into lesson maps (date -> lesson name/link)
    const lessonNames: Record<string, string> = {};
    const lessonLinks: Record<string, string> = {};

    schedules.forEach((schedule) => {
      if (schedule.lesson) {
        lessonNames[schedule.date] = schedule.lesson.name;
        if (schedule.lesson.resource_url) {
          lessonLinks[schedule.date] = schedule.lesson.resource_url;
        }
      }
    });

    // Transform students to match expected schema
    const transformedStudents: Student[] = students.map((s) => ({
      id: s.id,
      name: s.name,
      is_visitor: s.is_visitor,
    }));

    // Build response matching the expected schema
    const response: AttendanceData = {
      success: true,
      dates,
      lessonNames,
      lessonLinks,
      students: transformedStudents,
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
    const { getAllSchedules, createSchedule } = await import('./supabase/schedules');
    const schedules = await getAllSchedules();

    let schedule = schedules.find(
      (s) => s.date === date && s.service_time_id === serviceTimeId
    );

    // If schedule doesn't exist, create it
    if (!schedule) {
      console.log("Schedule not found, creating new schedule...");
      schedule = await createSchedule({
        date,
        service_time_id: serviceTimeId,
        lesson_id: null,
        event_type: 'regular',
        is_cancelled: false,
        notes: null,
      });
    }

    // Save attendance records
    const savedRecords = await supabaseBulkSave(schedule.id, records);

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
