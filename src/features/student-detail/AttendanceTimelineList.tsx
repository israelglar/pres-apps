import { History, CalendarX } from 'lucide-react'
import { theme } from '../../config/theme'
import { AttendanceRecordCard } from './AttendanceRecordCard'
import type { SundayAttendanceRecord } from './student-detail.logic'

interface AttendanceTimelineListProps {
  records: SundayAttendanceRecord[]
  isLoading?: boolean
}

/**
 * Timeline list of attendance records for a student
 * Displays chronologically with newest first
 */
export function AttendanceTimelineList({
  records,
  isLoading = false,
}: AttendanceTimelineListProps) {
  // Empty state
  if (!isLoading && records.length === 0) {
    return (
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-lg p-5 text-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${theme.backgrounds.neutral} flex items-center justify-center`}>
            <CalendarX className={`w-6 h-6 ${theme.text.neutralLight}`} />
          </div>
          <div>
            <h3 className={`text-base font-semibold ${theme.text.neutralDarker} mb-1`}>
              Sem registos de presença
            </h3>
            <p className={`text-sm ${theme.text.neutral}`}>
              Este pré ainda não tem presenças registadas
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <History className={`w-4 h-4 ${theme.text.primary}`} />
        <h2 className={`text-base font-semibold ${theme.text.neutralDarker}`}>
          Histórico de Presenças
        </h2>
        {records.length > 0 && (
          <span className={`ml-auto text-sm ${theme.text.neutral} font-medium`}>
            {records.length} {records.length === 1 ? 'registo' : 'registos'}
          </span>
        )}
      </div>

      {/* Timeline of Records */}
      <div className="space-y-3">
        {records.map((record) => (
          <AttendanceRecordCard key={record.date} record={record} />
        ))}
      </div>
    </div>
  )
}
