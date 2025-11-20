import { useState, useMemo } from 'react'
import { History, CalendarX } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { theme } from '../../config/theme'
import { updateAttendanceRecord } from '../../api/supabase/attendance'
import { successVibration, errorVibration } from '../../utils/haptics'
import { queryKeys } from '../../lib/queryKeys'
import { AttendanceRecordCard } from './AttendanceRecordCard'
import { NotesDialog } from '../lessons/components/NotesDialog'
import { AddPastLessonButton } from './AddPastLessonButton'
import type { SundayAttendanceRecord } from './student-detail.logic'
import type { AttendanceRecordWithRelations } from '../../types/database.types'

interface AttendanceTimelineListProps {
  records: SundayAttendanceRecord[]
  studentId: number
  studentName: string
  isLoading?: boolean
}

/**
 * Timeline list of attendance records for a student
 * Displays chronologically with newest first
 */
export function AttendanceTimelineList({
  records,
  studentId,
  studentName,
  isLoading = false,
}: AttendanceTimelineListProps) {
  const queryClient = useQueryClient()
  const [singleRecordNotesDialog, setSingleRecordNotesDialog] = useState<AttendanceRecordWithRelations | null>(null)

  // Calculate existing dates for filtering in AddPastLessonDialog
  const existingDates = useMemo(() => {
    return new Set(records.map(r => r.date))
  }, [records])

  // Mutation for editing attendance records
  const editMutation = useMutation({
    mutationFn: async ({
      recordIds,
      status,
      notes,
    }: {
      recordIds: number[]
      status?: 'present' | 'absent' | 'late' | 'excused'
      notes?: string | null
    }) => {
      // Update all records (for all service times on that Sunday)
      const updates = recordIds.map(recordId =>
        updateAttendanceRecord(recordId, { status, notes })
      )
      return Promise.all(updates)
    },
    onSuccess: () => {
      // Invalidate student attendance query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance(studentId) })
      successVibration()
      setSingleRecordNotesDialog(null)
    },
    onError: (error) => {
      console.error('Failed to update attendance:', error)
      errorVibration()
    },
  })

  // Handle status change for a single record (specific service time)
  const handleSingleRecordStatusChange = (recordId: number, newStatus: 'present' | 'absent' | 'late' | 'excused') => {
    editMutation.mutate({ recordIds: [recordId], status: newStatus })
  }

  // Handle opening notes dialog for single record (specific service time)
  const handleOpenSingleRecordNotesDialog = (record: AttendanceRecordWithRelations) => {
    setSingleRecordNotesDialog(record)
  }

  // Handle closing single record notes dialog
  const handleCloseSingleRecordNotesDialog = () => {
    setSingleRecordNotesDialog(null)
  }

  // Handle submitting notes for single record
  const handleSubmitSingleRecordNotes = (recordId: number, notes: string) => {
    editMutation.mutate({ recordIds: [recordId], notes })
  }

  // Empty state
  if (!isLoading && records.length === 0) {
    return (
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-sm p-5 text-center`}>
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

      {/* Add Past Lesson Button */}
      <AddPastLessonButton
        studentId={studentId}
        studentName={studentName}
        existingDates={existingDates}
      />

      {/* Timeline of Records */}
      <div className="space-y-3">
        {records.map((record) => (
          <AttendanceRecordCard
            key={record.date}
            record={record}
            studentId={studentId}
            onSingleRecordStatusChange={handleSingleRecordStatusChange}
            onSingleRecordNotesDialog={handleOpenSingleRecordNotesDialog}
          />
        ))}
      </div>

      {/* Notes Dialog for Single Record (specific service time) */}
      {singleRecordNotesDialog && (
        <NotesDialog
          record={singleRecordNotesDialog}
          onClose={handleCloseSingleRecordNotesDialog}
          onSubmit={handleSubmitSingleRecordNotes}
          isSubmitting={editMutation.isPending}
        />
      )}
    </div>
  )
}
