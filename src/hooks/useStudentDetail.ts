import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getStudentById } from '../api/supabase/students'
import { getAttendanceByStudent } from '../api/supabase/attendance'
import {
  calculateAttendanceStats,
  getConsecutiveAbsences,
  groupBySunday,
  calculateAge,
  type AttendanceStats,
  type SundayAttendanceRecord,
} from '../features/student-detail/student-detail.logic'
import { queryKeys } from '../lib/queryKeys'
import { QUERY } from '@/config/constants'

interface UseStudentDetailOptions {
  studentId: number
}

interface UseStudentDetailReturn {
  // Student data
  student: ReturnType<typeof getStudentById> extends Promise<infer T> ? T : never
  age: number | null

  // Attendance data (grouped by Sunday)
  sundayRecords: SundayAttendanceRecord[]
  stats: AttendanceStats
  consecutiveAbsences: number
  hasAbsenceAlert: boolean

  // State
  isLoading: boolean
  isError: boolean
  error: Error | null

  // Actions
  refetch: () => void
}

/**
 * Custom hook to fetch and process student detail data
 * Combines student info with their attendance history grouped by Sunday
 */
export function useStudentDetail({
  studentId,
}: UseStudentDetailOptions): UseStudentDetailReturn {
  // Fetch student info
  const {
    data: student,
    isLoading: isLoadingStudent,
    isError: isErrorStudent,
    error: errorStudent,
    refetch: refetchStudent,
  } = useQuery({
    queryKey: queryKeys.student(studentId),
    queryFn: () => getStudentById(studentId),
    staleTime: QUERY.STALE_TIME_MEDIUM,
  })

  // Fetch attendance records
  const {
    data: attendanceRecords = [],
    isLoading: isLoadingAttendance,
    isError: isErrorAttendance,
    error: errorAttendance,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: queryKeys.studentAttendance(studentId),
    queryFn: () => getAttendanceByStudent(studentId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Calculate age from date of birth
  const age = useMemo(() => {
    return calculateAge(student?.date_of_birth || null)
  }, [student?.date_of_birth])

  // Group attendance records by Sunday
  const sundayRecords = useMemo(() => {
    return groupBySunday(attendanceRecords)
  }, [attendanceRecords])

  // Calculate attendance statistics (Sunday-based)
  const stats = useMemo(() => {
    return calculateAttendanceStats(sundayRecords)
  }, [sundayRecords])

  // Check for consecutive absences (Sunday-based)
  const consecutiveAbsences = useMemo(() => {
    return getConsecutiveAbsences(sundayRecords)
  }, [sundayRecords])

  // Show alert if 3 or more consecutive absent Sundays
  const hasAbsenceAlert = consecutiveAbsences >= 3

  // Combined refetch function for pull-to-refresh
  const refetch = () => {
    refetchStudent()
    refetchAttendance()
  }

  // Combined loading and error states
  const isLoading = isLoadingStudent || isLoadingAttendance
  const isError = isErrorStudent || isErrorAttendance
  const error = (errorStudent || errorAttendance) as Error | null

  return {
    student: student || null,
    age,
    sundayRecords,
    stats,
    consecutiveAbsences,
    hasAbsenceAlert,
    isLoading,
    isError,
    error,
    refetch,
  }
}
