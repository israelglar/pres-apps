import { Clock } from 'lucide-react'
import { theme } from '../../config/theme'
import type { SundayAttendanceRecord } from './student-detail.logic'
import { getStatusLabel, getStatusIcon } from './student-detail.logic'

interface AttendanceRecordCardProps {
  record: SundayAttendanceRecord
}

/**
 * Sunday attendance record card for student detail view
 * Compact style matching DateGroupCard layout
 */
export function AttendanceRecordCard({ record }: AttendanceRecordCardProps) {
  const { dateDisplay, status, serviceTimes, lesson, notes } = record

  // Get status styling
  const statusLabel = getStatusLabel(status)
  const statusIcon = getStatusIcon(status)

  // Status config for colors
  const statusConfig = {
    present: { text: theme.status.present.text, bg: theme.status.present.bg },
    absent: { text: theme.status.absent.text, bg: theme.status.absent.bg },
    late: { text: theme.status.late.text, bg: theme.status.late.bg },
    excused: { text: theme.status.excused.text, bg: theme.status.excused.bg },
  }
  const statusStyle = statusConfig[status]

  // Format date to match DateGroupCard style (e.g., "10 nov 2025")
  const formatShortDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split(' ')
    return `${parseInt(day)} ${month.toLowerCase()} ${year}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className={`${theme.backgrounds.white} p-5`}>
        {/* Lesson Name as Title */}
        <div className="mb-3">
          <h3 className={`text-base font-normal ${theme.text.onLight} leading-tight`}>
            {lesson?.name || "Sem lição"}
          </h3>
        </div>

        {/* Bottom Row: Status + Service Times + Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle.text} ${statusStyle.bg}`}
            >
              <span className="leading-none">{statusIcon}</span>
              {statusLabel}
            </span>

            {/* Service Time Badges */}
            {serviceTimes.length > 0 && (
              <div className="flex items-center gap-1">
                {serviceTimes.map((serviceTime) => (
                  <div
                    key={serviceTime.id}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${theme.backgrounds.primaryLight} ${theme.text.primaryDark} text-xs font-semibold`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{serviceTime.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date in bottom right */}
          <span className={`${theme.text.onLightSecondary} text-xs whitespace-nowrap`}>
            {formatShortDate(dateDisplay)}
          </span>
        </div>

        {/* Notes (if present) */}
        {notes && (
          <div className={`mt-3 pt-3 border-t ${theme.borders.neutralLight}`}>
            <p className={`text-sm ${theme.text.neutral} italic`}>
              <span className="font-semibold not-italic">Notas: </span>
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
