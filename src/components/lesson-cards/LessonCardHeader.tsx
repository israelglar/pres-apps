import { theme } from "../../config/theme";
import { formatShortDate, getDateLabel } from "./lesson-date-utils";

interface LessonCardHeaderProps {
  lessonName: string;
  date: string; // ISO format "YYYY-MM-DD" or already formatted "DD MMM YYYY"
  dateLabel?: "Hoje" | "Domingo Passado" | null;
  interactive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode; // For custom content (stats, badges, etc.)
  className?: string;
}

/**
 * Shared header component for lesson cards
 * Used by DateGroupCard and AttendanceRecordCard
 *
 * Displays lesson name and formatted date with optional badge
 * Can be interactive (clickable) or static
 */
export function LessonCardHeader({
  lessonName,
  date,
  dateLabel: dateLabelProp,
  interactive = false,
  onClick,
  children,
  className = "",
}: LessonCardHeaderProps) {
  // Auto-detect date label if not provided (for YYYY-MM-DD format)
  const dateLabel =
    dateLabelProp !== undefined
      ? dateLabelProp
      : date.includes("-")
        ? getDateLabel(date)
        : null;

  // Format date for display
  const formattedDate = formatShortDate(date);

  const content = (
    <>
      {/* Lesson Name */}
      <h3
        className={`text-sm font-medium ${theme.text.onLight} leading-tight`}
      >
        {lessonName}
      </h3>

      {/* Date and Badge Row */}
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

      {/* Custom content (stats, badges, etc.) */}
      {children && <div className="mt-2">{children}</div>}
    </>
  );

  if (interactive && onClick) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left ${theme.backgrounds.white} ${theme.backgrounds.neutralHover} active:bg-gray-100 transition-colors ${className}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`${className}`}>{content}</div>;
}
