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
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          {stats.present}
        </span>
        {showAbsent && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {stats.absent}
          </span>
        )}
        {stats.late > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {stats.late}
          </span>
        )}
        {stats.excused > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {stats.excused}
          </span>
        )}
        {stats.visitors > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
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
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {stats.present}
          </span>
        )}
        {stats.late > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {stats.late}
          </span>
        )}
        {stats.excused > 0 && (
          <span className="flex items-center gap-1 text-xs text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {stats.excused}
          </span>
        )}
        {stats.visitors > 0 && (
          <span className="flex items-center gap-1 text-xs text-cyan-600">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
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
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Users className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-600">Presenças</p>
          <p className="text-base font-bold text-green-600">{stats.present}</p>
        </div>
      </div>

      {/* Absent */}
      {showAbsent && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <UserX className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Faltas</p>
            <p className="text-base font-bold text-red-600">{stats.absent}</p>
          </div>
        </div>
      )}

      {/* Late */}
      {stats.late > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Atrasados</p>
            <p className="text-base font-bold text-amber-600">{stats.late}</p>
          </div>
        </div>
      )}

      {/* Excused */}
      {stats.excused > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Justificadas</p>
            <p className="text-base font-bold text-blue-600">{stats.excused}</p>
          </div>
        </div>
      )}

      {/* Visitors */}
      {stats.visitors > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Visitantes</p>
            <p className="text-base font-bold text-cyan-600">{stats.visitors}</p>
          </div>
        </div>
      )}
    </div>
  );
}
