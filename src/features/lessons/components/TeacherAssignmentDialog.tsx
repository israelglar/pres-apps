import { useState, useEffect } from "react";
import { X, Users, Loader2 } from "lucide-react";
import { theme, buttonClasses } from "../../../config/theme";
import type { Teacher, ScheduleAssignment } from "../../../types/database.types";
import { getAllTeachers } from "../../../api/supabase/teachers";
import { updateScheduleAssignments } from "../../../api/supabase/scheduleAssignments";
import { lightTap, successVibration, errorVibration } from "../../../utils/haptics";

interface TeacherAssignmentDialogProps {
  scheduleId: number;
  currentAssignments: (ScheduleAssignment & { teacher?: { name: string } })[];
  serviceTime?: string; // e.g., "09:00" or "11:00"
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * TeacherAssignmentDialog - Manage teacher assignments for a lesson schedule
 * Allows selecting multiple teachers to assign to a specific lesson
 */
export function TeacherAssignmentDialog({
  scheduleId,
  currentAssignments,
  serviceTime,
  onClose,
  onSuccess,
}: TeacherAssignmentDialogProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load teachers and set initial selections
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const teachersData = await getAllTeachers();
        setTeachers(teachersData);

        // Set initially selected teachers
        const currentTeacherIds = currentAssignments
          .map((a) => a.teacher_id)
          .filter((id): id is number => id !== undefined);
        setSelectedTeacherIds(new Set(currentTeacherIds));

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load teachers:", err);
        setError("Erro ao carregar professores");
        errorVibration();
        setIsLoading(false);
      }
    };

    loadTeachers();
  }, [currentAssignments]);

  const handleToggleTeacher = (teacherId: number) => {
    lightTap();
    setSelectedTeacherIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateScheduleAssignments(scheduleId, Array.from(selectedTeacherIds));
      successVibration();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update teacher assignments:", err);
      setError("Erro ao guardar atribuições");
      errorVibration();
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    lightTap();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div
          className={`${theme.backgrounds.white} rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b ${theme.borders.neutralLight}`}>
            <div className="flex items-center gap-3">
              <div className={`${theme.backgrounds.primaryLight} p-2 rounded-xl`}>
                <Users className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${theme.text.onLight}`}>
                  Gerir Professores
                </h2>
                {serviceTime && (
                  <p className={`text-xs ${theme.text.onLightSecondary} mt-0.5`}>
                    Horário: {serviceTime}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-xl ${theme.backgrounds.neutralLight} ${theme.text.neutral} hover:${theme.backgrounds.primaryLight} hover:${theme.text.primary} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2
                  className={`w-12 h-12 ${theme.text.primary} animate-spin mb-3`}
                />
                <p className={`${theme.text.neutralDarker} text-sm font-semibold`}>
                  A carregar professores...
                </p>
              </div>
            )}

            {error && (
              <div
                className={`${theme.backgrounds.error} border-2 ${theme.borders.error} rounded-xl p-4 mb-4`}
              >
                <p className={`${theme.text.error} font-semibold text-sm`}>
                  {error}
                </p>
              </div>
            )}

            {!isLoading && !error && (
              <div className="space-y-2">
                <p className={`${theme.text.onLightSecondary} text-xs mb-3`}>
                  Selecione os professores para esta lição
                </p>

                {teachers.map((teacher) => {
                  const isSelected = selectedTeacherIds.has(teacher.id);

                  return (
                    <button
                      key={teacher.id}
                      onClick={() => handleToggleTeacher(teacher.id)}
                      disabled={isSaving}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${theme.borders.primary} ${theme.backgrounds.primaryLighter} shadow-md`
                          : `${theme.borders.neutralLight} ${theme.backgrounds.white} hover:${theme.borders.primary} hover:shadow-md`
                      } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? `${theme.borders.primary} ${theme.backgrounds.primary}`
                            : `${theme.borders.neutral} ${theme.backgrounds.white}`
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className={`w-3 h-3 ${theme.text.white}`}
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Teacher Name */}
                      <span
                        className={`flex-1 text-left font-medium text-sm ${
                          isSelected ? theme.text.primaryDarker : theme.text.onLight
                        }`}
                      >
                        {teacher.name}
                      </span>
                    </button>
                  );
                })}

                {teachers.length === 0 && (
                  <p className={`${theme.text.neutral} text-sm text-center py-8`}>
                    Nenhum professor disponível
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && !error && (
            <div className={`flex gap-3 p-5 border-t ${theme.borders.neutralLight}`}>
              <button
                onClick={handleClose}
                disabled={isSaving}
                className={`${buttonClasses.secondary} flex-1`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`${buttonClasses.primary} flex-1 flex items-center justify-center gap-2`}
              >
                {isSaving && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isSaving ? "A guardar..." : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
