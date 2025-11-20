import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  formatShortDate,
  ServiceTimeBadges,
} from "../../components/lesson-cards";
import { theme } from "../../config/theme";
import { getActiveServiceTimes } from "../../api/supabase/service-times";
import { ServiceTimeRecordRow } from "./ServiceTimeRecordRow";
import { AddServiceTimeButton } from "./AddServiceTimeButton";
import type { SundayAttendanceRecord } from "./student-detail.logic";
import type { AttendanceRecordWithRelations } from "../../types/database.types";
import { getStatusIcon, getStatusLabel } from "./student-detail.logic";

interface AttendanceRecordCardProps {
  record: SundayAttendanceRecord
  studentId: number
  onSingleRecordStatusChange: (recordId: number, newStatus: 'present' | 'absent') => void
  onSingleRecordNotesDialog: (record: AttendanceRecordWithRelations) => void
}

/**
 * Sunday attendance record card for student detail view
 * Compact style matching DateGroupCard layout
 * Expandable when multiple service times exist
 */
export function AttendanceRecordCard({
  record,
  studentId,
  onSingleRecordStatusChange,
  onSingleRecordNotesDialog,
}: AttendanceRecordCardProps) {
  const { dateDisplay, status, serviceTimes, lesson, notes, originalRecords } = record
  const [isExpanded, setIsExpanded] = useState(false)

  // Fetch active service times
  const { data: activeServiceTimes = [] } = useQuery({
    queryKey: ['service-times', 'active'],
    queryFn: getActiveServiceTimes,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Calculate missing service times
  const missingServiceTimes = useMemo(() => {
    // Get service time IDs from existing records (check both direct field and relation)
    const existingServiceTimeIds = originalRecords
      .map(r => r.service_time_id || r.schedule?.service_time_id)
      .filter((id): id is number => id !== null && id !== undefined)

    // Remove duplicates
    const uniqueIds = Array.from(new Set(existingServiceTimeIds))

    // Filter out service times that already exist
    const missing = activeServiceTimes.filter(
      st => !uniqueIds.includes(st.id)
    )

    return missing
  }, [originalRecords, activeServiceTimes])

  // Get status styling
  const statusLabel = getStatusLabel(status)
  const statusIcon = getStatusIcon(status)

  // Status config for colors
  const statusConfig = {
    present: { text: theme.status.present.text, bg: theme.status.present.bg },
    absent: { text: theme.status.absent.text, bg: theme.status.absent.bg },
  }
  const statusStyle = statusConfig[status];

  // Handle expand/collapse toggle
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-visible">
      <button
        onClick={handleToggleExpand}
        className={`w-full text-left ${theme.backgrounds.white} p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-2xl`}
      >
        {/* Header: Lesson Name */}
        <div className="mb-3">
          <h3 className={`text-sm font-medium ${theme.text.onLight} leading-tight`}>
            {lesson?.name || "Sem lição"}
          </h3>
        </div>

        {/* Bottom Row: Status + Service Times + Date + Expand Button */}
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
            <ServiceTimeBadges
              serviceTimes={serviceTimes}
              variant="compact"
              showIcon={true}
            />
          </div>

          {/* Date + Expand Button */}
          <div className="flex items-center gap-2">
            <span className={`${theme.text.onLightSecondary} text-xs whitespace-nowrap`}>
              {formatShortDate(dateDisplay)}
            </span>
            {/* Expand/Collapse Chevron (always visible) */}
            <div className={`p-1 ${theme.text.neutral}`}>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Notes (if present) */}
      {notes && (
        <div className={`px-5 pb-3`}>
          <div className={`pt-3 border-t ${theme.borders.neutralLight}`}>
            <p className={`text-sm ${theme.text.neutral} italic`}>
              <span className="font-semibold not-italic">Notas: </span>
              {notes}
            </p>
          </div>
        </div>
      )}

      {/* Expanded Service Time Records (always available when expanded) */}
      {isExpanded && (
        <div className={`px-5 pb-5`}>
          <div className={`pt-3 border-t ${theme.borders.neutralLight} space-y-2`}>
            {originalRecords.map((serviceRecord) => (
              <ServiceTimeRecordRow
                key={serviceRecord.id}
                record={serviceRecord}
                onStatusChange={onSingleRecordStatusChange}
                onOpenNotesDialog={onSingleRecordNotesDialog}
              />
            ))}

            {/* Add missing service times */}
            {missingServiceTimes.length > 0 && (
              <AddServiceTimeButton
                date={record.date}
                studentId={studentId}
                missingServiceTimes={missingServiceTimes}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
