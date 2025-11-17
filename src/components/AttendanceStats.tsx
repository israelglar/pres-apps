import { theme } from "../config/theme";
import type { AttendanceStats as AttendanceStatsType } from "../utils/attendance";

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
  mode?: "inline" | "compact" | "detailed";
  showAbsent?: boolean;
  showTotalPresent?: boolean;
}

/**
 * AttendanceStats - Reusable component for displaying attendance statistics
 *
 * Modes:
 * - inline: Small circles with numbers inline (for collapsed cards)
 * - compact: Small circles only, no absent (for quick attendance display)
 * - detailed: Full boxes with icons and labels (for expanded cards)
 */
export function AttendanceStats({
  stats,
  mode = "inline",
  showAbsent = false,
  showTotalPresent = true,
}: AttendanceStatsProps) {
  // Don't render if no data
  if (stats.total === 0) return null;

  // Count how many categories have values
  const categoriesWithValues = [
    stats.present > 0,
    showAbsent && stats.absent > 0,
    stats.late > 0,
    stats.excused > 0,
    stats.visitors > 0,
  ].filter(Boolean).length;

  // Only show total if there's more than one category with values
  const shouldShowTotal = showTotalPresent && categoriesWithValues > 1;

  // Inline mode - small circles with numbers
  if (mode === "inline") {
    return (
      <div className={`flex items-center gap-3 ${theme.text.neutral} text-xs h-5`}>
        {shouldShowTotal && (
          <span
            className={`flex items-center justify-center text-xs font-bold ${theme.text.primary} border ${theme.borders.primary} rounded px-1.5 h-5 min-w-[1.25rem]`}
          >
            {stats.totalPresent}
          </span>
        )}
        <span className="flex items-center gap-1 h-5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${theme.indicators.present}`}
          ></span>
          {stats.present}
        </span>
        {stats.late > 0 && (
          <span className="flex items-center gap-1 h-5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.late}`}
            ></span>
            {stats.late}
          </span>
        )}
        {stats.excused > 0 && (
          <span className="flex items-center gap-1 h-5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.excused}`}
            ></span>
            {stats.excused}
          </span>
        )}
        {stats.visitors > 0 && (
          <span className="flex items-center gap-1 h-5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.visitor}`}
            ></span>
            {stats.visitors}
          </span>
        )}
        {showAbsent && (
          <span className="flex items-center gap-1 h-5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.absent}`}
            ></span>
            {stats.absent}
          </span>
        )}
      </div>
    );
  }

  // Compact mode - small circles only, centered
  if (mode === "compact") {
    return (
      <div className="flex items-center justify-center gap-2 h-5">
        {shouldShowTotal && (
          <span
            className={`flex items-center justify-center text-xs font-bold ${theme.text.primary} border ${theme.borders.primary} rounded px-1.5 h-5 min-w-[1.25rem]`}
          >
            {stats.totalPresent}
          </span>
        )}
        {stats.present > 0 && (
          <span
            className={`flex items-center gap-1 text-xs ${theme.status.present.text} h-5`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.present}`}
            ></span>
            {stats.present}
          </span>
        )}
        {stats.late > 0 && (
          <span
            className={`flex items-center gap-1 text-xs ${theme.status.late.text} h-5`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.late}`}
            ></span>
            {stats.late}
          </span>
        )}
        {stats.excused > 0 && (
          <span
            className={`flex items-center gap-1 text-xs ${theme.status.excused.text} h-5`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.excused}`}
            ></span>
            {stats.excused}
          </span>
        )}
        {stats.visitors > 0 && (
          <span
            className={`flex items-center gap-1 text-xs ${theme.text.primary} h-5`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.visitor}`}
            ></span>
            {stats.visitors}
          </span>
        )}
      </div>
    );
  }

  // Detailed mode - compact layout with line wrapping
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {/* Present */}
      <div className="flex items-baseline gap-1">
        <span className={theme.text.neutral}>Presenças:</span>
        <span className={`font-bold ${theme.status.present.text}`}>
          {stats.present}
        </span>
      </div>

      {/* Absent */}
      {showAbsent && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Faltas:</span>
          <span className={`font-bold ${theme.status.absent.text}`}>
            {stats.absent}
          </span>
        </div>
      )}

      {/* Late */}
      {stats.late > 0 && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Atrasados:</span>
          <span className={`font-bold ${theme.status.late.text}`}>
            {stats.late}
          </span>
        </div>
      )}

      {/* Excused */}
      {stats.excused > 0 && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Justificadas:</span>
          <span className={`font-bold ${theme.status.excused.text}`}>
            {stats.excused}
          </span>
        </div>
      )}

      {/* Visitors */}
      {stats.visitors > 0 && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Visitantes:</span>
          <span className={`font-bold ${theme.text.primary}`}>
            {stats.visitors}
          </span>
        </div>
      )}
    </div>
  );
}
