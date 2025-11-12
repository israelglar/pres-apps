import { Calendar, Clock, BookOpen, User } from 'lucide-react'
import { theme } from '../../config/theme'
import type { SundayAttendanceRecord } from './student-detail.logic'
import { getStatusColor, getStatusLabel, getStatusIcon } from './student-detail.logic'

interface AttendanceRecordCardProps {
  record: SundayAttendanceRecord
}

/**
 * Sunday attendance record card for student detail view
 * Shows date, lesson, status (merged across services), service time badges, and optional notes/teacher
 */
export function AttendanceRecordCard({ record }: AttendanceRecordCardProps) {
  const { dateDisplay, status, serviceTimes, lesson, notes, teacher } = record

  // Get status styling
  const statusColor = getStatusColor(status)
  const statusLabel = getStatusLabel(status)
  const statusIcon = getStatusIcon(status)

  return (
    <div className={`${theme.backgrounds.white} rounded-xl shadow-lg p-3 hover:shadow-xl transition-shadow`}>
      {/* Header: Date and Service Time Badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${theme.text.primary}`} />
          <span className={`text-base font-semibold ${theme.text.neutralDarker}`}>{dateDisplay}</span>
        </div>
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

      {/* Lesson Name */}
      {lesson && (
        <div className="flex items-start gap-2 mb-3">
          <BookOpen className={`w-4 h-4 ${theme.text.neutral} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm ${theme.text.neutralDark} line-clamp-2 leading-relaxed`}>
            {lesson.name}
          </p>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusColor}`}
        >
          <span className="leading-none">{statusIcon}</span>
          {statusLabel}
        </span>
      </div>

      {/* Teacher Name */}
      {teacher && (
        <div className={`flex items-center gap-1.5 text-sm ${theme.text.neutral} mb-2`}>
          <User className="w-4 h-4" />
          <span>Prof: {teacher}</span>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className={`mt-3 pt-3 border-t ${theme.borders.neutralLight}`}>
          <p className={`text-sm ${theme.text.neutral} italic leading-relaxed`}>
            <span className="font-semibold not-italic">Notas: </span>
            {notes}
          </p>
        </div>
      )}
    </div>
  )
}
