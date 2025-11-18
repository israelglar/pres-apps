import { BookOpen, Calendar } from "lucide-react";
import { theme } from "../../../config/theme";
import type { Lesson } from "../../../types/database.types";

interface UnscheduledLessonCardProps {
  lesson: Lesson;
  onClick: (lessonId: number) => void;
}

/**
 * Card component for displaying an unscheduled lesson
 * Shows lesson name, curriculum series, and lesson number
 * Click to navigate to lesson detail page for scheduling
 */
export function UnscheduledLessonCard({
  lesson,
  onClick,
}: UnscheduledLessonCardProps) {
  return (
    <button
      onClick={() => onClick(lesson.id)}
      className={`w-full ${theme.backgrounds.white} rounded-2xl shadow-lg p-5 mb-3 transition-all hover:shadow-xl active:scale-[0.98]`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`${theme.backgrounds.primaryLight} p-3 rounded-xl flex-shrink-0`}
        >
          <BookOpen className={`w-6 h-6 ${theme.text.primary}`} />
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          {/* Lesson Name */}
          <h3 className={`text-base font-bold ${theme.text.neutralDarkest} mb-1`}>
            {lesson.name}
          </h3>

          {/* Lesson Details */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {lesson.curriculum_series && (
              <span
                className={`px-2 py-1 ${theme.backgrounds.primaryLighter} ${theme.text.primaryDark} rounded-lg font-semibold`}
              >
                {lesson.curriculum_series}
                {lesson.lesson_number ? ` ${lesson.lesson_number}` : ""}
              </span>
            )}

            {lesson.is_special_event && (
              <span
                className={`px-2 py-1 ${theme.backgrounds.warning} ${theme.text.warning} rounded-lg font-semibold`}
              >
                Evento Especial
              </span>
            )}
          </div>

          {/* Call to Action */}
          <div className="flex items-center gap-2 mt-3">
            <Calendar className={`w-4 h-4 ${theme.text.neutral}`} />
            <span className={`text-xs ${theme.text.neutral}`}>
              Toque para agendar
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
