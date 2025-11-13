import React from "react";
import { AlertTriangle, CheckCircle, X, XCircle } from "lucide-react";
import { theme } from "../../config/theme";
import type { Student, AttendanceRecord } from "../../types/attendance.types";

export interface StudentListProps {
  students: Student[];
  attendanceRecords: Record<string, AttendanceRecord>;
  absenceAlerts: Map<number, { absenceCount: number }>;
  currentStudentId?: string; // Optional - highlights current student in swipe mode
  emptyMessage?: string; // Optional - shown when students array is empty
  onStudentClick: (student: Student, isMarked: boolean) => void;
  onDismissAlert: (studentId: number) => void;
  studentRefs?: React.MutableRefObject<Record<string, HTMLButtonElement | null>>; // Optional - for swipe auto-scroll
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  attendanceRecords,
  absenceAlerts,
  currentStudentId,
  emptyMessage = "Nenhum pré encontrado",
  onStudentClick,
  onDismissAlert,
  studentRefs,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-5">
      <div className="space-y-2">
        {students.length === 0 ? (
          <div className={`text-center py-8 ${theme.text.neutral}`}>
            {emptyMessage}
          </div>
        ) : (
          students.map((student) => {
            const record = attendanceRecords[student.id];
            const isMarked = !!record;
            const isCurrent = currentStudentId === student.id;
            const studentIdNumber = parseInt(student.id);
            const alert = absenceAlerts.get(studentIdNumber);

            return (
              <div key={student.id}>
                <div className="relative">
                  <button
                    ref={(el) => {
                      if (studentRefs) {
                        studentRefs.current[student.id] = el;
                      }
                    }}
                    onClick={() => onStudentClick(student, isMarked)}
                    className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
                      isCurrent && !isMarked
                        ? `${theme.backgrounds.primaryLighter} border-2 ${theme.borders.primary} shadow-md`
                        : isMarked
                          ? record.status === "P"
                            ? `${theme.backgrounds.success} border-2 ${theme.borders.success} opacity-70 hover:opacity-80 hover:shadow-md cursor-pointer`
                            : `${theme.backgrounds.errorLight} border-2 ${theme.borders.error} opacity-70 hover:opacity-80 hover:shadow-md cursor-pointer`
                          : `${theme.backgrounds.white} border-2 ${theme.borders.primaryLight} ${theme.borders.primaryHover} hover:shadow-md active:scale-98 transition-all`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isMarked
                                ? record.status === "P"
                                  ? "text-green-800"
                                  : theme.status.absent.text
                                : theme.text.primary
                            }`}
                          >
                            {student.name}
                          </span>
                          {student.isVisitor && (
                            <span
                              className={`px-1.5 py-0.5 ${theme.solids.badge} ${theme.text.onPrimaryButton} text-xs font-bold rounded-full`}
                            >
                              Visitante
                            </span>
                          )}
                          {isCurrent && !isMarked && (
                            <span
                              className={`ml-1 w-2 h-2 ${theme.backgrounds.primary} rounded-full animate-pulse`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    {isMarked && (
                      <div className="bg-white rounded-full p-0.5">
                        {record.status === "P" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className={`w-4 h-4 ${theme.text.error}`} />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Absence Alert Overlay - Semi-transparent overlay that blocks clicks */}
                  {alert && !isMarked && (
                    <div
                      className="absolute inset-0 flex items-center justify-end px-3 bg-amber-50/40 rounded-xl z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg px-3 py-1.5 shadow-lg">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-semibold whitespace-nowrap">
                          Ausente há {alert.absenceCount}{" "}
                          {alert.absenceCount === 1 ? "domingo" : "domingos"}
                        </span>
                        <button
                          onClick={() => onDismissAlert(studentIdNumber)}
                          className="ml-1 p-0.5 rounded text-amber-700/80 hover:text-amber-900 hover:bg-white/20 transition-colors"
                          aria-label="Dispensar alerta"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
