import type { AttendanceRecordWithRelations } from '../types/database.types';

/**
 * Attendance statistics interface
 */
export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  visitors: number;
  total: number;
  totalPresent: number;
}

/**
 * Calculate statistics for attendance records
 *
 * @param records - Array of attendance records with student relations
 * @returns Statistics object with counts for each status and visitors
 */
export function calculateStats(records: AttendanceRecordWithRelations[]): AttendanceStats {
  // Count by status (excluding visitors to avoid confusion)
  const present = records.filter(r => r.status === 'present' && !r.student?.is_visitor).length;
  const absent = records.filter(r => r.status === 'absent' && !r.student?.is_visitor).length;
  const late = records.filter(r => r.status === 'late' && !r.student?.is_visitor).length;
  const excused = records.filter(r => r.status === 'excused' && !r.student?.is_visitor).length;

  // Count visitors separately (they can have any status)
  const visitors = records.filter(r => r.student?.is_visitor === true).length;

  const totalPresent = present + late + excused + visitors;
  const total = records.length;
  return {
    present,
    absent,
    late,
    excused,
    visitors,
    total,
    totalPresent,

  };
}
