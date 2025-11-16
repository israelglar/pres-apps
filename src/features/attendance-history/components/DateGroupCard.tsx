import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  onOpenAddDialog: (scheduleId: number, serviceTimeId: number | null) => void;
  onOpenDeleteDialog: (record: AttendanceRecordWithRelations) => void;
  onViewStudent: (studentId: number) => void;
  onRedoAttendance: (scheduleId: number) => void;
  initialExpanded?: boolean;
  shouldScrollIntoView?: boolean;
}

/**
 * Date Group Card - Shows all attendance for a specific date (all service times)
 * Header shows stats for both 09h and 11h
 * When expanded, shows detailed breakdown for each service time
 */
export function DateGroupCard({
  group,
  onQuickStatusChange,
  onOpenNotes,
  onOpenAddDialog,
  onOpenDeleteDialog,
  onViewStudent,
  onRedoAttendance,
  initialExpanded = false,
  shouldScrollIntoView = false
}: DateGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Find the index of 11:00 service time, default to 0 if not found
  const default11hIndex = group.serviceTimes.findIndex(
    st => st.schedule.service_time?.time === '11:00:00'
  );
  const [selectedServiceTimeIndex, setSelectedServiceTimeIndex] = useState(
    default11hIndex !== -1 ? default11hIndex : 0
  );

  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view if requested (with a slight delay to allow rendering)
  useEffect(() => {
    if (shouldScrollIntoView && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [shouldScrollIntoView]);

  const toggleExpand = () => {
    lightTap();
    setIsExpanded(!isExpanded);
  };

  // Format date for display (short format: "10 nov 2025")
  const date = new Date(group.date);
  const day = date.getDate();
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  // Get lesson name (should be the same for all service times on this date)
  const lessonName = group.serviceTimes[0]?.schedule.lesson?.name || "Sem lição";
  const lessonUrl = group.serviceTimes[0]?.schedule.lesson?.resource_url;

  return (
    <div ref={cardRef} className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={toggleExpand}
        className={`${theme.backgrounds.white} p-4 w-full text-left ${theme.backgrounds.neutralHover} transition-all active:scale-[0.99]`}
      >
        {/* Lesson Name and Date */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className={`text-base font-normal ${theme.text.onLight} leading-tight`}>
              {lessonName}
            </h3>
            <span className={`${theme.text.onLightSecondary} text-xs mt-1 block`}>
              {formattedDate}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${theme.text.neutral} flex-shrink-0`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${theme.text.neutral} flex-shrink-0`} />
          )}
        </div>

        {/* Summary Stats - Show stats for each service time */}
        <div className="flex items-center gap-4 flex-wrap">
          {group.serviceTimes.map((serviceTimeData) => {
            const timeFormatted = serviceTimeData.schedule.service_time?.time.slice(0, 5) || 'N/A';

            return (
              <div key={serviceTimeData.schedule.id} className="flex items-center gap-2">
                <span className={`${theme.text.primary} font-bold text-sm`}>
                  {timeFormatted}
                </span>
                <AttendanceStats
                  stats={serviceTimeData.stats}
                  mode="inline"
                  showAbsent={false}
                  showTotalPresent={true}
                  showVisitorLabel={false}
                />
              </div>
            );
          })}
        </div>
      </button>

      {/* Expanded Content - Only show when expanded */}
      {isExpanded && (
        <>
          {/* Lesson Link - Show when expanded */}
          {lessonUrl && (
            <div className="px-4 pt-2 pb-1">
              <a
                href={lessonUrl}
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

          {/* Service Time Tabs - Only show if there are multiple service times */}
          {group.serviceTimes.length > 1 && (
            <div className="px-4 pb-2">
              <div className="flex gap-1.5">
                {group.serviceTimes.map((serviceTimeData, index) => {
                  const timeFormatted = serviceTimeData.schedule.service_time?.time.slice(0, 5) || 'N/A';
                  const isSelected = selectedServiceTimeIndex === index;

                  return (
                    <button
                      key={serviceTimeData.schedule.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        lightTap();
                        setSelectedServiceTimeIndex(index);
                      }}
                      className={`flex-1 px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        isSelected
                          ? `${theme.backgrounds.primary} ${theme.text.white}`
                          : `${theme.backgrounds.neutralLight} ${theme.text.neutral} hover:${theme.backgrounds.primaryLight}`
                      }`}
                    >
                      {timeFormatted}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Service Time Content - Show only selected service time */}
          {group.serviceTimes[selectedServiceTimeIndex] && (() => {
            const serviceTimeData = group.serviceTimes[selectedServiceTimeIndex];
            const timeFormatted = serviceTimeData.schedule.service_time?.time.slice(0, 5) || 'N/A';

            // Group students by status
            const presentRegular = serviceTimeData.records.filter(r =>
              (r.status === 'present' || r.status === 'late') && !r.student?.is_visitor
            ).sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

            const presentVisitors = serviceTimeData.records.filter(r =>
              (r.status === 'present' || r.status === 'late') && r.student?.is_visitor
            ).sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

            const absent = serviceTimeData.records.filter(r =>
              r.status === 'absent' || r.status === 'excused'
            ).sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

            const groupedRecords = { presentRegular, presentVisitors, absent };

            return (
              <div>
                {/* Stats Header - Only show if there's a single service time (no tabs) */}
                {group.serviceTimes.length === 1 && (
                  <div className={`px-4 py-2 ${theme.backgrounds.primaryLighter}`}>
                    <div className="flex items-center justify-between">
                      <span className={`${theme.text.primary} font-bold text-sm`}>
                        {timeFormatted}
                      </span>
                      <AttendanceStats
                        stats={serviceTimeData.stats}
                        mode="inline"
                        showAbsent={true}
                        showTotalPresent={true}
                        showVisitorLabel={true}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-4 py-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      lightTap();
                      onOpenAddDialog(serviceTimeData.schedule.id, serviceTimeData.schedule.service_time_id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 ${theme.solids.primaryButton} ${theme.text.onPrimaryButton} rounded-lg text-xs font-medium hover:shadow-md active:scale-[0.99] transition-all`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Adicionar Pré
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      lightTap();
                      onRedoAttendance(serviceTimeData.schedule.id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 ${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primary} rounded-lg text-xs font-medium hover:${theme.backgrounds.primaryLight} active:scale-[0.99] transition-all`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Refazer
                  </button>
                </div>

                {/* Student List */}
                {serviceTimeData.records.length > 0 ? (
                  <div className="px-4 pb-4 space-y-2">
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
                  <div className="px-4 pb-4">
                    <p className={`text-center ${theme.text.neutral} text-sm`}>
                      Nenhum registo de presença
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
