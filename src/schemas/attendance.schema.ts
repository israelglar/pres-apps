import { z } from 'zod';

/**
 * Schema for student data (simplified for frontend)
 */
export const studentSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_visitor: z.boolean().optional(),
});

/**
 * Schema for lesson data
 */
export const lessonSchema = z.object({
  id: z.number(),
  name: z.string(),
  resource_url: z.string().nullable(),
  curriculum_series: z.string().nullable(),
  lesson_number: z.number().nullable(),
  is_special_event: z.boolean(),
});

/**
 * Schema for service time data
 */
export const serviceTimeSchema = z.object({
  id: z.number(),
  time: z.string(),
  name: z.string(),
  is_active: z.boolean(),
  display_order: z.number(),
});

/**
 * Schema for schedule data
 */
export const scheduleSchema = z.object({
  id: z.number(),
  date: z.string(), // ISO format YYYY-MM-DD
  service_time_id: z.number().nullable(),
  lesson_id: z.number().nullable(),
  event_type: z.enum(['regular', 'family_service', 'cancelled', 'retreat', 'party']),
  is_cancelled: z.boolean(),
  lesson: lessonSchema.optional(),
  service_time: serviceTimeSchema.optional(),
  attendance_count: z.number().optional(), // Count of attendance records for this schedule
  has_attendance: z.boolean().optional(), // Derived: whether attendance has been marked
});

/**
 * Schema for attendance data response from API
 * This is the main response structure for the frontend
 */
export const attendanceDataSchema = z.object({
  success: z.boolean(),
  dates: z.array(z.string()), // Array of ISO date strings
  schedules: z.array(scheduleSchema), // Full schedule data with lessons and service times
  students: z.array(studentSchema),
  serviceTimes: z.array(serviceTimeSchema),
});

/**
 * Schema for a student with ID (enriched version) - kept for backward compatibility
 */
export const studentWithIdSchema = z.object({
  id: z.number(),
  name: z.string(),
});

/**
 * Schema for attendance record to be submitted
 */
export const attendanceRecordSchema = z.object({
  student_id: z.number(),
  schedule_id: z.number(),
  status: z.enum(['present', 'absent', 'excused', 'late']),
  service_time_id: z.number().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for bulk attendance save request
 */
export const bulkAttendanceSaveSchema = z.object({
  date: z.string(), // ISO format
  service_time_id: z.number(),
  records: z.array(z.object({
    student_id: z.number(),
    status: z.enum(['present', 'absent', 'excused', 'late']),
    notes: z.string().optional(),
  })),
});

/**
 * Schema for bulk update request - kept for backward compatibility
 */
export const bulkUpdateRequestSchema = z.object({
  records: z.array(attendanceRecordSchema),
});

/**
 * Infer TypeScript types from Zod schemas
 */
export type AttendanceData = z.infer<typeof attendanceDataSchema>;
export type Student = z.infer<typeof studentSchema>;
export type StudentWithId = z.infer<typeof studentWithIdSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type ServiceTime = z.infer<typeof serviceTimeSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type BulkAttendanceSave = z.infer<typeof bulkAttendanceSaveSchema>;
export type BulkUpdateRequest = z.infer<typeof bulkUpdateRequestSchema>;
