import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { theme } from "../../../config/theme";
import type { AttendanceRecordWithRelations } from "../../../types/database.types";
import { lightTap } from "../../../utils/haptics";
import type { AttendanceHistoryGroup } from "../hooks/useAttendanceHistory";
import { StudentAttendanceRow } from "./StudentAttendanceRow";
import { AttendanceStats } from "../../../components/AttendanceStats";
import { StatusGroupSeparator } from "./StatusGroupSeparator";

interface DateGroupCardProps {
  group: AttendanceHistoryGroup;
  onQuickStatusChange: (recordId: number, newStatus: 'present' | 'absent' | 'late' | 'excused') => void;
  onOpenNotes: (record: AttendanceRecordWithRelations) => void;
  onOpenAddDialog: () => void;
  onOpenDeleteDialog: (record: AttendanceRecordWithRelations) => void;
  onViewStudent: (studentId: number) => void;
  onRedoAttendance: (scheduleId: number) => void;
  initialExpanded?: boolean;
  shouldScrollIntoView?: boolean;
}

/**
 * Date Group Card - Shows all attendance for a specific date
 * Includes lesson info, service time, student list, and summary stats
 * Starts collapsed, expands when clicked
 */
export function DateGroupCard({ group, onQuickStatusChange, onOpenNotes, onOpenAddDialog, onOpenDeleteDialog, onViewStudent, onRedoAttendance, initialExpanded = false, shouldScrollIntoView = false }: DateGroupCardProps) {
  const { schedule, records, stats } = group;
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view if requested (with a slight delay to allow rendering)
  useEffect(() => {
    if (shouldScrollIntoView && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [shouldScrollIntoView]);

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

  // Group students by status: Present (including late) vs Absent/Excused
  // Within present group: regular students first, then visitors
  const groupedRecords = useMemo(() => {
    // Present = 'present' or 'late' (they were there!)
    // Absent = 'absent' or 'excused' (they didn't come)

    const presentRegular = records.filter(r =>
      (r.status === 'present' || r.status === 'late') && !r.student?.is_visitor
    ).sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

    const presentVisitors = records.filter(r =>
      (r.status === 'present' || r.status === 'late') && r.student?.is_visitor
    ).sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

    const absent = records.filter(r =>
      r.status === 'absent' || r.status === 'excused'
    ).sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

    return { presentRegular, presentVisitors, absent };
  }, [records]);

  return (
    <div ref={cardRef} className="bg-white rounded-2xl shadow-md overflow-hidden">
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

          {/* Action Buttons */}
          <div className="px-5 pb-3 space-y-2">
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightTap();
                onRedoAttendance(schedule.id);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primary} rounded-xl text-sm font-medium hover:${theme.backgrounds.primaryLight} active:scale-[0.99] transition-all`}
            >
              <RotateCcw className="w-4 h-4" />
              Refazer Presenças
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
              {/* Present Regular Students */}
              {groupedRecords.presentRegular.map((record) => (
                <StudentAttendanceRow
                  key={record.id}
                  record={record}
                  onQuickStatusChange={onQuickStatusChange}
                  onOpenNotes={onOpenNotes}
                  onOpenDeleteDialog={onOpenDeleteDialog}
                  onViewStudent={onViewStudent}
                />
              ))}

              {/* Present Visitors */}
              {groupedRecords.presentVisitors.map((record) => (
                <StudentAttendanceRow
                  key={record.id}
                  record={record}
                  onQuickStatusChange={onQuickStatusChange}
                  onOpenNotes={onOpenNotes}
                  onOpenDeleteDialog={onOpenDeleteDialog}
                  onViewStudent={onViewStudent}
                />
              ))}

              {/* Separator (only show if there are absent students) */}
              {groupedRecords.absent.length > 0 && (
                <StatusGroupSeparator count={groupedRecords.absent.length} />
              )}

              {/* Absent Students */}
              {groupedRecords.absent.map((record) => (
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
