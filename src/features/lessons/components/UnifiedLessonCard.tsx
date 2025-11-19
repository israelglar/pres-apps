import React, { useMemo } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { TeacherList } from "../../../components/features/TeacherList";
import { formatShortDate } from "../../../components/lesson-cards";
import { theme } from "../../../config/theme";
import type { ScheduleWithRelations } from "../../../types/database.types";
import { lightTap } from "../../../utils/haptics";
import type { UnifiedLesson } from "../hooks/useLessonsUnified";

interface UnifiedLessonCardProps {
  unifiedLesson: UnifiedLesson;
  onLessonClick: (lessonId: number, date: string) => void;
}

/**
 * Unified Lesson Card - Shows a lesson with all its schedules aggregated
 * Groups schedules by date and shows service times with attendance and teachers
 */
export const UnifiedLessonCard = React.memo<UnifiedLessonCardProps>(({
  unifiedLesson,
  onLessonClick,
}) => {
  const { lesson, schedules, isScheduled } = unifiedLesson;

  // For scheduled lessons, click the most recent schedule
  const handleCardClick = () => {
    lightTap();
    if (isScheduled && schedules[0]) {
      onLessonClick(lesson.id, schedules[0].date);
    }
  };

  // Memoize expensive computations - group and sort schedules
  const { schedulesByDate, visibleDates, hiddenCount } = useMemo(() => {
    // Group schedules by date (to avoid showing same date multiple times)
    const byDate = schedules.reduce(
      (acc, schedule) => {
        if (!acc[schedule.date]) {
          acc[schedule.date] = [];
        }
        acc[schedule.date].push(schedule);
        return acc;
      },
      {} as Record<string, ScheduleWithRelations[]>,
    );

    // Get sorted dates (most recent first)
    const sorted = Object.keys(byDate).sort((a, b) =>
      b.localeCompare(a),
    );

    // Show first 2 dates
    const visible = sorted.slice(0, 2);
    const hidden = sorted.length - 2;

    return {
      schedulesByDate: byDate,
      visibleDates: visible,
      hiddenCount: hidden
    };
  }, [schedules]);

  return (
    <button
      onClick={handleCardClick}
      className={`${theme.backgrounds.white} p-4 w-full text-left ${theme.backgrounds.neutralHover} active:bg-gray-100 transition-colors flex items-center gap-3 rounded-2xl shadow-md`}
    >
      {/* Content */}
      <div className="flex-1">
        {/* Lesson Name */}
        <div className="mb-3">
          <h3
            className={`text-sm font-medium ${theme.text.onLight} leading-tight`}
          >
            {lesson.name}
          </h3>

          {/* Curriculum Info */}
          {lesson.curriculum_series && (
            <p className={`${theme.text.onLightSecondary} text-xs mt-1`}>
              {lesson.curriculum_series}
              {lesson.lesson_number && ` • Lição ${lesson.lesson_number}`}
            </p>
          )}
        </div>

        {/* Schedule Details */}
        {isScheduled ? (
          <div className="space-y-2">
            {visibleDates.map((date) => {
              const schedulesForDate = schedulesByDate[date];
              // Sort by service time
              schedulesForDate.sort((a, b) =>
                (a.service_time?.time || "").localeCompare(
                  b.service_time?.time || "",
                ),
              );

              return (
                <div key={date} className="space-y-1">
                  {/* Date Header */}
                  <div className="flex items-center gap-1.5">
                    <Calendar
                      className={`w-3 h-3 ${theme.text.onLightSecondary}`}
                    />
                    <span
                      className={`${theme.text.onLight} text-xs font-medium`}
                    >
                      {formatShortDate(date)}
                    </span>
                  </div>

                  {/* Service Times for this date */}
                  <div className="pl-4 space-y-1">
                    {schedulesForDate.map((schedule) => {
                      const attendanceRecords =
                        (schedule.attendance_records as any[]) || [];
                      // Count only present records (includes regular students and visitors marked as present)
                      const presentCount = attendanceRecords.filter(
                        (record: any) => record.status === "present",
                      ).length;
                      const serviceTimeName =
                        schedule.service_time?.name || "N/A";
                      const assignments = schedule.assignments || [];

                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center gap-2 flex-wrap text-xs"
                        >
                          {/* Service Time */}
                          <span
                            className={`${theme.text.onLightSecondary} font-medium`}
                          >
                            • {serviceTimeName}
                          </span>

                          {/* Present Count (just the number) */}
                          {presentCount > 0 && (
                            <span
                              className={`${theme.text.success} font-medium`}
                            >
                              • {presentCount}
                            </span>
                          )}

                          {/* Teachers */}
                          {assignments.length > 0 && (
                            <div className="flex items-center">
                              <TeacherList
                                assignments={assignments}
                                emptyMessage=""
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Show more indicator */}
            {hiddenCount > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`${theme.text.onLightSecondary} text-xs`}>
                  + {hiddenCount} {hiddenCount === 1 ? "data" : "datas"} mais
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Unscheduled badge */
          <span
            className={`inline-block px-2 py-0.5 text-xs font-semibold ${theme.backgrounds.neutralLight} ${theme.text.neutral} rounded-full`}
          >
            Não agendada
          </span>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight
        className={`w-5 h-5 ${theme.text.onLightSecondary} flex-shrink-0`}
      />
    </button>
  );
});
