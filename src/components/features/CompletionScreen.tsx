import { AlertCircle, Loader2 } from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import type { AttendanceStats as AttendanceStatsType } from "../../utils/attendance";
import { AttendanceStats } from "../AttendanceStats";

interface PresentStudent {
  name: string;
  isVisitor?: boolean;
}

interface CompletionScreenProps {
  lessonName: string;
  presentCount: number;
  lateCount?: number;
  excusedCount?: number;
  visitorsCount?: number;
  presentStudents?: PresentStudent[];
  onConfirm: () => void;
  onGoBack: () => void;
  isLoading?: boolean;
}

/**
 * Shared completion screen shown after attendance is marked
 * Used by both swipe and search marking pages
 */
export function CompletionScreen({
  lessonName,
  presentCount,
  lateCount = 0,
  excusedCount = 0,
  visitorsCount = 0,
  presentStudents = [],
  onConfirm,
  onGoBack,
  isLoading = false,
}: CompletionScreenProps) {
  // Calculate total as everyone who attended (present + late + excused + visitors)
  const totalCount = presentCount + lateCount + excusedCount + visitorsCount;

  // Helper to format name as "FirstName LastName" (only first and last)
  const formatCompactName = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  // Build stats object for AttendanceStats component
  const stats: AttendanceStatsType = {
    total: totalCount,
    totalPresent: presentCount + lateCount + excusedCount + visitorsCount,
    present: presentCount,
    absent: 0, // Not needed in completion screen
    late: lateCount,
    excused: excusedCount,
    visitors: visitorsCount,
  };

  return (
    <div
      className={`min-h-screen ${theme.solids.background} flex items-center justify-center p-4 overflow-y-auto`}
    >
      <div className="max-w-md w-full text-center my-auto">
        <div
          className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 md:p-12`}
        >
          <p
            className={`${theme.text.neutral} mb-6 md:mb-8 text-base leading-relaxed`}
          >
            {lessonName}
          </p>

          {/* Attendance Stats */}
          <div className="mb-6 md:mb-8 flex justify-center">
            <AttendanceStats
              stats={stats}
              mode="detailed"
              showAbsent={false}
              showTotalPresent={true}
            />
          </div>

          {/* List of Present Students - Compact format */}
          {presentStudents.length > 0 && (
            <div
              className={`mb-6 p-4 ${theme.backgrounds.neutralLight} rounded-xl`}
            >
              <h3 className={`text-sm font-bold ${theme.text.onLight} mb-2`}>
                Prés Presentes:
              </h3>
              <div className="text-xs leading-relaxed">
                {presentStudents.map((student, index) => (
                  <span key={index} className={theme.text.neutral}>
                    {formatCompactName(student.name)}
                    {student.isVisitor && (
                      <span className={`${theme.text.visitor} font-bold`}>
                        {" "}
                        (V)
                      </span>
                    )}
                    {index < presentStudents.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prayer Reminder */}
          <div
            className={`mb-6 p-3 ${theme.backgrounds.warningLight} border ${theme.borders.warning} rounded-xl flex items-start gap-2`}
          >
            <AlertCircle
              className={`w-4 h-4 ${theme.text.warning} flex-shrink-0 mt-0.5`}
            />
            <p
              className={`text-xs ${theme.text.warning} text-left leading-relaxed`}
            >
              <span className="font-bold">Lembrete:</span> Estar atento a
              assuntos para oração durante a lição.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onGoBack}
              disabled={isLoading}
              className={`${buttonClasses.secondary} px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Voltar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${buttonClasses.primary} px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
