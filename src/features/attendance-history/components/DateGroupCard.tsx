import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
  onEditRecord: (record: AttendanceRecordWithRelations) => void;
}

/**
 * Date Group Card - Shows all attendance for a specific date
 * Includes lesson info, service time, student list, and summary stats
 * Starts collapsed, expands when clicked
 */
export function DateGroupCard({ group, onEditRecord }: DateGroupCardProps) {
  const { schedule, records, stats } = group;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    lightTap();
    setIsExpanded(!isExpanded);
  };

  // Format date for display
  const formattedDate = new Date(schedule.date).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Check if it's today
  const today = new Date().toISOString().split("T")[0];
  const isToday = schedule.date === today;

  // Sort students alphabetically
  const sortedRecords = [...records].sort((a, b) => {
    const nameA = a.student?.name || "";
    const nameB = b.student?.name || "";
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={toggleExpand}
        className={`${theme.backgrounds.white} p-5 w-full text-left ${theme.backgrounds.neutralHover} transition-all active:scale-[0.99]`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Calendar className={`w-4 h-4 ${theme.text.primary}`} />
              <h3 className={`text-base font-bold ${theme.text.neutralDarker}`}>
                {formattedDate}
                {isToday && (
                  <span
                    className={`ml-1.5 text-xs font-semibold ${theme.backgrounds.primary} ${theme.text.white} px-1.5 py-0.5 rounded-full`}
                  >
                    Hoje
                  </span>
                )}
              </h3>
            </div>

            {/* Lesson Name */}
            {schedule.lesson?.name && (
              <p className={`${theme.text.neutral} text-sm mt-0.5`}>
                {schedule.lesson.name}
              </p>
            )}

            {/* Summary Stats - Show when collapsed */}
            {!isExpanded && records.length > 0 && (
              <div className="mt-1.5">
                <AttendanceStats stats={stats} mode="inline" showAbsent={true} />
              </div>
            )}
          </div>

          {/* Right side: Expand/Collapse Icon */}
          <div className="flex items-center">
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${theme.text.primary}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${theme.text.primary}`} />
            )}
          </div>
        </div>
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
                  onEdit={onEditRecord}
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
