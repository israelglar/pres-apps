import type { AttendanceRecordWithRelations } from '../../types/database.types'

/**
 * Calculate age from date of birth
 * @param dateOfBirth - ISO date string (YYYY-MM-DD)
 * @returns Age in years, or null if no date provided
 */
export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null

  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Service time info for display
 */
export interface ServiceTimeInfo {
  id: number
  time: string // e.g., "09:00" or "11:00"
  name: string // e.g., "9h" or "11h"
}

/**
 * Sunday attendance record - merges all services for a single Sunday
 */
export interface SundayAttendanceRecord {
  date: string // ISO date (YYYY-MM-DD)
  dateDisplay: string // Formatted for display
  status: 'present' | 'absent' | 'excused' | 'late'
  serviceTimes: ServiceTimeInfo[] // Services attended (e.g., [9h, 11h])
  lesson: {
    id: number
    name: string
  } | null
  notes: string | null
  teacher: string | null
  originalRecords: AttendanceRecordWithRelations[] // Keep original records for reference
}

/**
 * Merge attendance status for a Sunday
 * If present at ANY service -> "present"
 * If all absent -> "absent"
 * If all excused -> "excused"
 * Mixed absent/excused -> "excused"
 */
function mergeAttendanceStatus(
  records: AttendanceRecordWithRelations[]
): 'present' | 'absent' | 'excused' | 'late' {
  if (records.length === 0) return 'absent'

  const statuses = records.map(r => r.status)

  // If ANY record is present or late, the Sunday is "present"
  if (statuses.includes('present') || statuses.includes('late')) {
    return 'present'
  }

  // If all records are excused, the Sunday is "excused"
  if (statuses.every(s => s === 'excused')) {
    return 'excused'
  }

  // If all records are absent, the Sunday is "absent"
  if (statuses.every(s => s === 'absent')) {
    return 'absent'
  }

  // Mixed absent/excused -> prioritize excused
  return 'excused'
}

/**
 * Group attendance records by Sunday and merge across services
 */
export function groupBySunday(
  records: AttendanceRecordWithRelations[]
): SundayAttendanceRecord[] {
  // Group by date
  const byDate = new Map<string, AttendanceRecordWithRelations[]>()

  for (const record of records) {
    const date = record.schedule?.date || ''
    if (!date) continue

    if (!byDate.has(date)) {
      byDate.set(date, [])
    }
    byDate.get(date)!.push(record)
  }

  // Convert to Sunday records
  const sundayRecords: SundayAttendanceRecord[] = []

  for (const [date, dateRecords] of byDate.entries()) {
    // Sort by service time for consistent ordering
    const sortedRecords = [...dateRecords].sort((a, b) => {
      const timeA = a.schedule?.service_time?.time || ''
      const timeB = b.schedule?.service_time?.time || ''
      return timeA.localeCompare(timeB)
    })

    // Merge status across services
    const status = mergeAttendanceStatus(sortedRecords)

    // Collect service times (only for services where student was present or late)
    const serviceTimes: ServiceTimeInfo[] = sortedRecords
      .filter(r => r.schedule?.service_time && (r.status === 'present' || r.status === 'late'))
      .map(r => ({
        id: r.schedule!.service_time!.id,
        time: r.schedule!.service_time!.time.substring(0, 5), // "09:00:00" -> "09:00"
        name: r.schedule!.service_time!.name, // "9h" or "11h"
      }))

    // Get lesson info (should be same for all records on this date)
    const lesson = sortedRecords[0].schedule?.lesson
      ? {
          id: sortedRecords[0].schedule.lesson.id,
          name: sortedRecords[0].schedule.lesson.name,
        }
      : null

    // Get notes and teacher (prioritize non-empty values)
    const notes = sortedRecords.find(r => r.notes)?.notes || null
    const teacher = sortedRecords[0].schedule?.assignments?.[0]?.teacher?.name || null

    sundayRecords.push({
      date,
      dateDisplay: formatDateForDisplay(date),
      status,
      serviceTimes,
      lesson,
      notes,
      teacher,
      originalRecords: sortedRecords,
    })
  }

  // Sort by date descending (newest first)
  return sundayRecords.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Calculate attendance statistics from Sunday records
 */
export interface AttendanceStats {
  total: number // total Sundays
  present: number // Sundays marked as present
  absent: number // Sundays marked as absent
  excused: number // Sundays marked as excused
  attendanceRate: number // percentage
}

export function calculateAttendanceStats(
  sundayRecords: SundayAttendanceRecord[]
): AttendanceStats {
  if (sundayRecords.length === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      excused: 0,
      attendanceRate: 0,
    }
  }

  const stats = sundayRecords.reduce(
    (acc, record) => {
      acc.total++
      switch (record.status) {
        case 'present':
        case 'late': // Count late as present
          acc.present++
          break
        case 'absent':
          acc.absent++
          break
        case 'excused':
          acc.excused++
          break
      }
      return acc
    },
    { total: 0, present: 0, absent: 0, excused: 0 }
  )

  // Calculate attendance rate: (present + excused) / total
  const attendedCount = stats.present + stats.excused
  const attendanceRate = (attendedCount / stats.total) * 100

  return {
    ...stats,
    attendanceRate: Math.round(attendanceRate),
  }
}

/**
 * Check for consecutive absences based on Sunday records
 * @param sundayRecords - Sunday records sorted by date (newest first)
 * @returns Number of consecutive absent Sundays from the most recent
 */
export function getConsecutiveAbsences(
  sundayRecords: SundayAttendanceRecord[]
): number {
  let count = 0

  // Records should be sorted newest first
  for (const record of sundayRecords) {
    if (record.status === 'absent') {
      count++
    } else {
      // Stop counting when we hit a non-absent Sunday
      break
    }
  }

  return count
}

/**
 * Format date for Portuguese display
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date like "05 Jan 2025"
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]

  const day = date.getDate().toString().padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: 'present' | 'absent' | 'excused' | 'late'): string {
  switch (status) {
    case 'present':
      return 'text-green-600 bg-green-50'
    case 'absent':
      return 'text-red-600 bg-red-50'
    case 'excused':
      return 'text-yellow-600 bg-yellow-50'
    case 'late':
      return 'text-orange-600 bg-orange-50'
  }
}

/**
 * Get status label in Portuguese
 */
export function getStatusLabel(status: 'present' | 'absent' | 'excused' | 'late'): string {
  switch (status) {
    case 'present':
      return 'Presente'
    case 'absent':
      return 'Falta'
    case 'excused':
      return 'Justificada'
    case 'late':
      return 'Atrasado'
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(status: 'present' | 'absent' | 'excused' | 'late'): string {
  switch (status) {
    case 'present':
      return '✓'
    case 'absent':
      return '×'
    case 'excused':
      return '○'
    case 'late':
      return '◷'
  }
}
