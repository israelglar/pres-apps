/**
 * Shared types for attendance marking features
 */

// Re-export Student type from useVisitorManagement for convenience
export type { Student } from '../hooks/useVisitorManagement';

/**
 * Represents a single attendance record for a student
 */
export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F"; // P = Present, F = Absent
  timestamp: Date;
  notes?: string; // Optional notes (e.g., visitor information)
}
