/**
 * Centralized Query Keys for TanStack Query
 *
 * All query keys are defined here for consistency and easier refactoring.
 * Use factory functions for parameterized keys to ensure type safety.
 */

export const queryKeys = {
  // Students
  students: (
    filter?: "all" | "active",
    includeAlerts?: boolean,
    alertThreshold?: number,
  ) => ["students", filter, includeAlerts, alertThreshold] as const,

  student: (id: number) => ["student", id] as const,

  studentAttendance: (id: number) => ["student-attendance", id] as const,

  // Schedules
  schedules: () => ["schedules"] as const,

  scheduleDates: () => ["schedule-dates"] as const,

  // Service Times
  serviceTimes: () => ["service-times"] as const,

  // Attendance
  attendanceHistory: (limit: number, serviceTimeFilter?: string) =>
    ["attendance-history", limit, serviceTimeFilter] as const,

  attendanceStats: (scheduleId: number) =>
    ["attendance-stats", scheduleId] as const,

  todayAttendance: (scheduleIds: number[]) =>
    ["today-attendance", scheduleIds] as const,

  // Alerts
  absenceAlerts: (threshold: number, currentDate?: string) =>
    ["absence-alerts", threshold, currentDate] as const,

  // Lessons (attendance history)
  lessons: () => ["lessons"] as const,

  // Lesson Catalog (lesson management CRUD)
  lessonCatalog: () => ["lesson-catalog"] as const,

  lesson: (id: number) => ["lesson", id] as const,
} as const;
