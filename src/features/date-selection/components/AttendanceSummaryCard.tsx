import { CheckCircle2, UserX, Users } from "lucide-react";
import { theme } from "../../../config/theme";
import type { AttendanceStats } from "../../../utils/attendance";

interface AttendanceSummaryCardProps {
  attendanceStats: AttendanceStats;
}

export function AttendanceSummaryCard({
  attendanceStats,
}: AttendanceSummaryCardProps) {
  return (
    <div
      className={`${theme.backgrounds.white} rounded-xl border ${theme.borders.primaryLight} shadow-md p-3`}
    >
      <label
        className={`block ${theme.text.primary} font-bold mb-2 text-xs uppercase tracking-wide flex items-center gap-2`}
      >
        <Users className="w-4 h-4" />
        Resumo de Presenças
      </label>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Total Present */}
        <div
          className={`${theme.backgrounds.successLight} border ${theme.borders.success} rounded-lg p-2 text-center`}
        >
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className={`w-3.5 h-3.5 ${theme.text.success}`} />
            <span className={`text-lg font-bold ${theme.text.success}`}>
              {attendanceStats.totalPresent}
            </span>
          </div>
          <p className={`text-[10px] font-semibold ${theme.text.success} leading-tight mt-0.5`}>
            Presentes
          </p>
        </div>

        {/* Total Absent */}
        <div
          className={`${theme.backgrounds.errorLight} border ${theme.borders.error} rounded-lg p-2 text-center`}
        >
          <div className="flex items-center justify-center gap-1">
            <UserX className={`w-3.5 h-3.5 ${theme.text.error}`} />
            <span className={`text-lg font-bold ${theme.text.error}`}>
              {attendanceStats.absent}
            </span>
          </div>
          <p className={`text-[10px] font-semibold ${theme.text.error} leading-tight mt-0.5`}>Faltas</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div
        className={`${theme.backgrounds.neutralLight} rounded-lg p-2 space-y-1.5`}
      >
        <p
          className={`text-[10px] font-bold ${theme.text.neutralDarker} uppercase tracking-wide mb-1`}
        >
          Detalhes
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${theme.indicators.present}`}
            />
            <span className={`text-xs ${theme.text.neutralDarker}`}>
              Presentes
            </span>
          </div>
          <span className={`text-xs font-bold ${theme.text.neutralDarker}`}>
            {attendanceStats.present}
          </span>
        </div>

        {attendanceStats.late > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.indicators.late}`}
              />
              <span className={`text-xs ${theme.text.neutralDarker}`}>
                Atrasados
              </span>
            </div>
            <span className={`text-xs font-bold ${theme.text.neutralDarker}`}>
              {attendanceStats.late}
            </span>
          </div>
        )}

        {attendanceStats.excused > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.indicators.excused}`}
              />
              <span className={`text-xs ${theme.text.neutralDarker}`}>
                Justificadas
              </span>
            </div>
            <span className={`text-xs font-bold ${theme.text.neutralDarker}`}>
              {attendanceStats.excused}
            </span>
          </div>
        )}

        {attendanceStats.visitors > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.indicators.visitor}`}
              />
              <span className={`text-xs ${theme.text.neutralDarker}`}>
                Visitantes
              </span>
            </div>
            <span className={`text-xs font-bold ${theme.text.neutralDarker}`}>
              {attendanceStats.visitors}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
