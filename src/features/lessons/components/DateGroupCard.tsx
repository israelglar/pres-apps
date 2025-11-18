import { ChevronRight } from "lucide-react";
import { AttendanceStats } from "../../../components/AttendanceStats";
import {
  formatShortDate,
  getDateLabel,
} from "../../../components/lesson-cards";
import { TeacherList } from "../../../components/features/TeacherList";
import { theme } from "../../../config/theme";
import { lightTap } from "../../../utils/haptics";
import type { LessonGroup } from "../hooks/useLessons";

interface DateGroupCardProps {
  group: LessonGroup;
  onDateClick: (date: string) => void;
}

/**
 * Date Group Card - Shows summary of attendance for a specific date (all service times)
 * Click to navigate to LessonDetailPage for full details
 */
export function DateGroupCard({
  group,
  onDateClick,
}: DateGroupCardProps) {
  const handleCardClick = () => {
    lightTap();
    onDateClick(group.date);
  };

  // Use shared date formatting utilities
  const formattedDate = formatShortDate(group.date);
  const dateLabel = getDateLabel(group.date);

  // Get lesson name (should be the same for all service times on this date)
  const lessonName =
    group.serviceTimes[0]?.schedule.lesson?.name || "Sem lição";

  // Collect all unique teacher assignments across all service times
  const allAssignments = group.serviceTimes
    .flatMap((st) => st.schedule.assignments || [])
    .filter((assignment, index, self) =>
      // Remove duplicates by teacher_id
      index === self.findIndex((a) => a.teacher_id === assignment.teacher_id)
    );

  return (
    <button
      onClick={handleCardClick}
      className={`${theme.backgrounds.white} p-4 w-full text-left ${theme.backgrounds.neutralHover} transition-all active:scale-[0.99] flex items-center gap-3 rounded-2xl shadow-md`}
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
          <div className="flex items-center gap-2 mt-1 flex-wrap">
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
          {/* Teachers */}
          {allAssignments.length > 0 && (
            <div className="mt-2">
              <TeacherList assignments={allAssignments} emptyMessage="" />
            </div>
          )}
        </div>

        {/* Summary Stats - Show stats for each service time that has attendance */}
        <div className="flex items-center gap-4 flex-wrap">
          {group.serviceTimes
            .filter((serviceTimeData) => serviceTimeData.records.length > 0)
            .map((serviceTimeData) => {
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
  );
}
