/**
 * Absence Alert Types
 * Types for the absence alert system that warns teachers about students with consecutive absences
 */

/**
 * Represents an absence alert for a student
 */
export interface AbsenceAlert {
  /** Student ID */
  studentId: number;

  /** Number of consecutive absences */
  absenceCount: number;

  /** Dates of the absences (ISO format) */
  absenceDates: string[];

  /** First absence date (ISO format) */
  firstAbsenceDate: string;

  /** Last absence date (ISO format) */
  lastAbsenceDate: string;
}

/**
 * Map of student IDs to their absence alerts
 */
export type AbsenceAlertsMap = Map<number, AbsenceAlert>;

/**
 * Props for the AbsenceAlertBanner component
 */
export interface AbsenceAlertBannerProps {
  /** Number of consecutive absences */
  absenceCount: number;

  /** Callback when the alert is dismissed */
  onDismiss: () => void;

  /** Optional additional CSS classes */
  className?: string;
}
