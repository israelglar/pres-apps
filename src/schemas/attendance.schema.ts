import { z } from 'zod';

/**
 * Schema for student data
 */
export const studentSchema = z.object({
  name: z.string(),
});

/**
 * Schema for attendance data response from API
 */
export const attendanceDataSchema = z.object({
  success: z.boolean(),
  dates: z.array(z.string()),
  lessonNames: z.record(z.string(), z.string()),
  lessonLinks: z.record(z.string(), z.string()),
  students: z.array(studentSchema),
});

/**
 * Schema for a student with ID (enriched version)
 */
export const studentWithIdSchema = z.object({
  id: z.number(),
  name: z.string(),
});

/**
 * Schema for attendance record to be submitted
 */
export const attendanceRecordSchema = z.object({
  name: z.string(),
  date: z.date(),
  status: z.enum(['present', 'absent', 'excused', 'late']),
});

/**
 * Schema for bulk update request
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
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type BulkUpdateRequest = z.infer<typeof bulkUpdateRequestSchema>;
