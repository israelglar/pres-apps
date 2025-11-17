import { ChevronRight, ExternalLink, RotateCcw, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AttendanceStats } from "../../../components/AttendanceStats";
import {
  formatShortDate,
  getDateLabel,
} from "../../../components/lesson-cards";
import { theme } from "../../../config/theme";
import type { AttendanceRecordWithRelations } from "../../../types/database.types";
import { lightTap } from "../../../utils/haptics";
import type { LessonGroup } from "../hooks/useLessons";
import { StatusGroupSeparator } from "./StatusGroupSeparator";
import { StudentAttendanceRow } from "./StudentAttendanceRow";

interface DateGroupCardProps {
  group: LessonGroup;
  onQuickStatusChange: (
    recordId: number,
    newStatus: "present" | "absent" | "late" | "excused",
  ) => void;
  onOpenNotes: (record: AttendanceRecordWithRelations) => void;
  onOpenAddDialog: (scheduleId: number, serviceTimeId: number | null) => void;
  onOpenDeleteDialog: (record: AttendanceRecordWithRelations) => void;
  onViewStudent: (studentId: number) => void;
  onRedoAttendance: (scheduleId: number) => void;
  onDateClick?: (date: string) => void;
  initialExpanded?: boolean;
  shouldScrollIntoView?: boolean;
  initialServiceTimeId?: number;
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
  onDateClick,
  initialExpanded = false,
  shouldScrollIntoView = false,
  initialServiceTimeId,
}: DateGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Determine initial service time index
  const getInitialServiceTimeIndex = () => {
    // If initialServiceTimeId is provided, find its index
    if (initialServiceTimeId) {
      const index = group.serviceTimes.findIndex(
        (st) => st.schedule.service_time_id === initialServiceTimeId,
      );
      if (index !== -1) return index;
    }

    // Otherwise, find the index of 11:00 service time, default to 0 if not found
    const default11hIndex = group.serviceTimes.findIndex(
      (st) => st.schedule.service_time?.time === "11:00:00",
    );
    return default11hIndex !== -1 ? default11hIndex : 0;
  };

  const [selectedServiceTimeIndex, setSelectedServiceTimeIndex] = useState(
    getInitialServiceTimeIndex(),
  );

  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view if requested (with a slight delay to allow rendering)
  useEffect(() => {
    if (shouldScrollIntoView && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [shouldScrollIntoView]);

  const handleCardClick = () => {
    lightTap();
    if (onDateClick) {
      onDateClick(group.date);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Use shared date formatting utilities
  const formattedDate = formatShortDate(group.date);
  const dateLabel = getDateLabel(group.date);

  // Get lesson name (should be the same for all service times on this date)
  const lessonName =
    group.serviceTimes[0]?.schedule.lesson?.name || "Sem lição";
  const lessonUrl = group.serviceTimes[0]?.schedule.lesson?.resource_url;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
    >
      {/* Header - Clickable to navigate to detail page */}
      <button
        onClick={handleCardClick}
        className={`${theme.backgrounds.white} p-4 w-full text-left ${theme.backgrounds.neutralHover} transition-all active:scale-[0.99] flex items-center gap-3`}
      >
        {/* Content */}
        <div className="flex-1">
          {/* Lesson Name and Date */}
          <div className="mb-3">
            <h3
              className={`text-sm font-medium ${theme.text.onLight} leading-tight`}
            >
              {lessonName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`${theme.text.onLightSecondary} text-xs`}>
                {formattedDate}
              </span>
              {dateLabel && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold ${theme.solids.badge} ${theme.text.onPrimary} rounded-full shadow-sm`}
                >
                  {dateLabel}
                </span>
              )}
            </div>
          </div>

          {/* Summary Stats - Show stats for each service time */}
          <div className="flex items-center gap-4 flex-wrap">
            {group.serviceTimes.map((serviceTimeData) => {
              const timeFormatted =
                serviceTimeData.schedule.service_time?.time.slice(0, 5) ||
                "N/A";

              return (
                <div
                  key={serviceTimeData.schedule.id}
                  className="flex items-center gap-2"
                >
                  <span className={`${theme.text.primary} font-semibold text-xs`}>
                    {timeFormatted}
                  </span>
                  <AttendanceStats
                    stats={serviceTimeData.stats}
                    mode="inline"
                    showAbsent={false}
                    showTotalPresent={true}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Chevron - Centered vertically */}
        <ChevronRight
          className={`w-5 h-5 ${theme.text.neutral} flex-shrink-0`}
        />
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
                  const timeFormatted =
                    serviceTimeData.schedule.service_time?.time.slice(0, 5) ||
                    "N/A";
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
          {group.serviceTimes[selectedServiceTimeIndex] &&
            (() => {
              const serviceTimeData =
                group.serviceTimes[selectedServiceTimeIndex];
              const timeFormatted =
                serviceTimeData.schedule.service_time?.time.slice(0, 5) ||
                "N/A";

              // Group students by status
              const presentRegular = serviceTimeData.records
                .filter(
                  (r) =>
                    (r.status === "present" || r.status === "late") &&
                    !r.student?.is_visitor,
                )
                .sort((a, b) =>
                  (a.student?.name || "").localeCompare(b.student?.name || ""),
                );

              const presentVisitors = serviceTimeData.records
                .filter(
                  (r) =>
                    (r.status === "present" || r.status === "late") &&
                    r.student?.is_visitor,
                )
                .sort((a, b) =>
                  (a.student?.name || "").localeCompare(b.student?.name || ""),
                );

              const absent = serviceTimeData.records
                .filter((r) => r.status === "absent" || r.status === "excused")
                .sort((a, b) =>
                  (a.student?.name || "").localeCompare(b.student?.name || ""),
                );

              const groupedRecords = {
                presentRegular,
                presentVisitors,
                absent,
              };

              return (
                <div>
                  {/* Stats Header - Only show if there's a single service time (no tabs) */}
                  {group.serviceTimes.length === 1 && (
                    <div
                      className={`px-4 py-2 ${theme.backgrounds.primaryLighter}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`${theme.text.primary} font-semibold text-xs`}
                        >
                          {timeFormatted}
                        </span>
                        <AttendanceStats
                          stats={serviceTimeData.stats}
                          mode="inline"
                          showAbsent={true}
                          showTotalPresent={true}
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
                        onOpenAddDialog(
                          serviceTimeData.schedule.id,
                          serviceTimeData.schedule.service_time_id,
                        );
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
                        <StatusGroupSeparator
                          count={groupedRecords.absent.length}
                        />
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
                      <p
                        className={`text-center ${theme.text.neutral} text-sm`}
                      >
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
