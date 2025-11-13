import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { theme } from "../../../config/theme";
import type { AttendanceRecordWithRelations } from "../../../types/database.types";
import { lightTap } from "../../../utils/haptics";
import type { AttendanceHistoryGroup } from "../hooks/useAttendanceHistory";
import { StudentAttendanceRow } from "./StudentAttendanceRow";
import { AttendanceStats } from "../../../components/AttendanceStats";

interface DateGroupCardProps {
  group: AttendanceHistoryGroup;
  onQuickStatusChange: (recordId: number, newStatus: 'present' | 'absent' | 'late' | 'excused') => void;
  onOpenNotes: (record: AttendanceRecordWithRelations) => void;
  onOpenAddDialog: () => void;
  onOpenDeleteDialog: (record: AttendanceRecordWithRelations) => void;
  onViewStudent: (studentId: number) => void;
}

/**
 * Date Group Card - Shows all attendance for a specific date
 * Includes lesson info, service time, student list, and summary stats
 * Starts collapsed, expands when clicked
 */
export function DateGroupCard({ group, onQuickStatusChange, onOpenNotes, onOpenAddDialog, onOpenDeleteDialog, onViewStudent }: DateGroupCardProps) {
  const { schedule, records, stats } = group;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    lightTap();
    setIsExpanded(!isExpanded);
  };

  // Format date for display (short format: "10 nov 2025")
  const date = new Date(schedule.date);
  const day = date.getDate();
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  // Sort students alphabetically
  const sortedRecords = [...records].sort((a, b) => {
    const nameA = a.student?.name || "";
    const nameB = b.student?.name || "";
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={toggleExpand}
        className={`${theme.backgrounds.white} p-5 w-full text-left ${theme.backgrounds.neutralHover} transition-all active:scale-[0.99]`}
      >
        {/* Lesson Name as Title with chevron */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className={`text-base font-normal ${theme.text.onLight} leading-tight flex-1`}>
            {schedule.lesson?.name || "Sem lição"}
          </h3>
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${theme.text.neutral} flex-shrink-0`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${theme.text.neutral} flex-shrink-0`} />
          )}
        </div>

        {/* Summary Stats - Show when collapsed */}
        {!isExpanded && records.length > 0 && (
          <div className="flex items-center justify-between">
            <AttendanceStats stats={stats} mode="inline" showAbsent={true} />

            {/* Date in bottom right corner */}
            <span className={`${theme.text.onLightSecondary} text-xs whitespace-nowrap`}>
              {formattedDate}
            </span>
          </div>
        )}
      </button>

      {/* Expanded Content - Only show when expanded */}
      {isExpanded && (
        <>
          {/* Lesson Link - Show when expanded */}
          {schedule.lesson?.resource_url && (
            <div className="px-5 pt-3 pb-2">
              <a
                href={schedule.lesson.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 text-sm ${theme.text.primary} hover:underline transition-colors`}
              >
                <ExternalLink className="w-4 h-4" />
                Ver currículo
              </a>
            </div>
          )}

          {/* Add Student Button */}
          <div className="px-5 pb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightTap();
                onOpenAddDialog();
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${theme.solids.primaryButton} ${theme.text.onPrimaryButton} rounded-xl text-sm font-medium hover:shadow-md active:scale-[0.99] transition-all`}
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Pré
            </button>
          </div>

          {/* Summary Stats - Detailed view when expanded */}
          {records.length > 0 && (
            <div
              className={`${theme.solids.cardHighlight} p-5 border-t ${theme.borders.neutralLight}`}
            >
              <AttendanceStats stats={stats} mode="detailed" showAbsent={true} />
            </div>
          )}

          {/* Student List */}
          {records.length > 0 ? (
            <div className="p-5 space-y-2">
              {sortedRecords.map((record) => (
                <StudentAttendanceRow
                  key={record.id}
                  record={record}
                  onQuickStatusChange={onQuickStatusChange}
                  onOpenNotes={onOpenNotes}
                  onOpenDeleteDialog={onOpenDeleteDialog}
                  onViewStudent={onViewStudent}
                />
              ))}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className={`${theme.text.neutralMedium} text-sm`}>
                Nenhuma presença registada
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
