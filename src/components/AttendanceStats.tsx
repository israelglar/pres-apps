import { Clock, FileText, UserPlus, Users, UserX } from 'lucide-react';
import { theme } from '../config/theme';
import type { AttendanceStats as AttendanceStatsType } from '../utils/attendance';

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
  mode?: 'inline' | 'compact' | 'detailed';
  showAbsent?: boolean;
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
}: AttendanceStatsProps) {
  // Don't render if no data
  if (stats.total === 0) return null;

  // Inline mode - small circles with numbers
  if (mode === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${theme.text.neutral} text-xs`}>
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

  // Detailed mode - full boxes with icons and labels
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Present */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${theme.status.present.bgMedium} flex items-center justify-center`}>
          <Users className={`w-4 h-4 ${theme.status.present.text}`} />
        </div>
        <div>
          <p className={`text-xs ${theme.text.neutral}`}>Presenças</p>
          <p className={`text-base font-bold ${theme.status.present.text}`}>{stats.present}</p>
        </div>
      </div>

      {/* Absent */}
      {showAbsent && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${theme.status.absent.bgMedium} flex items-center justify-center`}>
            <UserX className={`w-4 h-4 ${theme.status.absent.text}`} />
          </div>
          <div>
            <p className={`text-xs ${theme.text.neutral}`}>Faltas</p>
            <p className={`text-base font-bold ${theme.status.absent.text}`}>{stats.absent}</p>
          </div>
        </div>
      )}

      {/* Late */}
      {stats.late > 0 && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${theme.status.late.bgMedium} flex items-center justify-center`}>
            <Clock className={`w-4 h-4 ${theme.status.late.text}`} />
          </div>
          <div>
            <p className={`text-xs ${theme.text.neutral}`}>Atrasados</p>
            <p className={`text-base font-bold ${theme.status.late.text}`}>{stats.late}</p>
          </div>
        </div>
      )}

      {/* Excused */}
      {stats.excused > 0 && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${theme.status.excused.bgMedium} flex items-center justify-center`}>
            <FileText className={`w-4 h-4 ${theme.status.excused.text}`} />
          </div>
          <div>
            <p className={`text-xs ${theme.text.neutral}`}>Justificadas</p>
            <p className={`text-base font-bold ${theme.status.excused.text}`}>{stats.excused}</p>
          </div>
        </div>
      )}

      {/* Visitors */}
      {stats.visitors > 0 && (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${theme.backgrounds.primaryLight} flex items-center justify-center`}>
            <UserPlus className={`w-4 h-4 ${theme.text.primary}`} />
          </div>
          <div>
            <p className={`text-xs ${theme.text.neutral}`}>Visitantes</p>
            <p className={`text-base font-bold ${theme.text.primary}`}>{stats.visitors}</p>
          </div>
        </div>
      )}
    </div>
  );
}
