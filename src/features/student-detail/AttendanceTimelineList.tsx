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
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <CalendarX className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Sem registos de presença
            </h3>
            <p className="text-sm text-gray-600">
              Este pré ainda não tem presenças registadas
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <History className={`w-5 h-5 ${theme.text.primary}`} />
        <h2 className="text-lg font-bold text-gray-800">
          Histórico de Presenças
        </h2>
        {records.length > 0 && (
          <span className="ml-auto text-sm text-gray-600">
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
