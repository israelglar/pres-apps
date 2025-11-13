import { theme } from '../config/theme';
import type { AttendanceStats as AttendanceStatsType } from '../utils/attendance';

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
  mode?: 'inline' | 'compact' | 'detailed';
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
  mode = 'inline',
  showAbsent = true,
  showTotalPresent = false,
}: AttendanceStatsProps) {
  // Don't render if no data
  if (stats.total === 0) return null;

  // Inline mode - small circles with numbers
  if (mode === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${theme.text.neutral} text-xs`}>
        {showTotalPresent && (
          <span className={`flex items-center gap-1 text-m font-bold ${theme.text.primary}`}>
            {stats.totalPresent}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.present}`}></span>
          {stats.present}
        </span>
        {showAbsent && (
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.absent}`}></span>
            {stats.absent}
          </span>
        )}
        {stats.late > 0 && (
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.late}`}></span>
            {stats.late}
          </span>
        )}
        {stats.excused > 0 && (
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.excused}`}></span>
            {stats.excused}
          </span>
        )}
        {stats.visitors > 0 && (
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.visitor}`}></span>
            {stats.visitors} visitantes
          </span>
        )}
      </div>
    );
  }

  // Compact mode - small circles only, centered
  if (mode === 'compact') {
    return (
      <div className="flex items-center justify-center gap-2">
        {showTotalPresent && (
          <span className={`text-m font-bold ${theme.text.primary}`}>
            {stats.totalPresent}
          </span>
        )}
        {stats.present > 0 && (
          <span className={`flex items-center gap-1 text-xs ${theme.status.present.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.present}`}></span>
            {stats.present}
          </span>
        )}
        {stats.late > 0 && (
          <span className={`flex items-center gap-1 text-xs ${theme.status.late.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.late}`}></span>
            {stats.late}
          </span>
        )}
        {stats.excused > 0 && (
          <span className={`flex items-center gap-1 text-xs ${theme.status.excused.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.excused}`}></span>
            {stats.excused}
          </span>
        )}
        {stats.visitors > 0 && (
          <span className={`flex items-center gap-1 text-xs ${theme.text.primary}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.indicators.visitor}`}></span>
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
        <span className={`font-bold ${theme.status.present.text}`}>{stats.present}</span>
      </div>

      {/* Absent */}
      {showAbsent && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Faltas:</span>
          <span className={`font-bold ${theme.status.absent.text}`}>{stats.absent}</span>
        </div>
      )}

      {/* Late */}
      {stats.late > 0 && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Atrasados:</span>
          <span className={`font-bold ${theme.status.late.text}`}>{stats.late}</span>
        </div>
      )}

      {/* Excused */}
      {stats.excused > 0 && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Justificadas:</span>
          <span className={`font-bold ${theme.status.excused.text}`}>{stats.excused}</span>
        </div>
      )}

      {/* Visitors */}
      {stats.visitors > 0 && (
        <div className="flex items-baseline gap-1">
          <span className={theme.text.neutral}>Visitantes:</span>
          <span className={`font-bold ${theme.text.primary}`}>{stats.visitors}</span>
        </div>
      )}
    </div>
  );
}
