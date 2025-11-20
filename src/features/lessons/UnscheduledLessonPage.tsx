import { useNavigate } from "@tanstack/react-router";
import { Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { buttonClasses, theme } from "../../config/theme";
import type { Lesson } from "../../types/database.types";
import { successVibration } from "../../utils/haptics";
import { ScheduleDialog } from "./components/ScheduleDialog";
import { useCreateSchedule } from "./hooks/useScheduleMutations";

interface UnscheduledLessonPageProps {
  lesson: Lesson;
  onBack: () => void;
}

/**
 * Unscheduled Lesson Page
 * Displays details of a lesson that hasn't been scheduled yet
 * Allows user to schedule the lesson to a specific date and service time
 */
export function UnscheduledLessonPage({
  lesson,
  onBack,
}: UnscheduledLessonPageProps) {
  const navigate = useNavigate();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const createScheduleMutation = useCreateSchedule();

  const handleScheduleSubmit = async (data: {
    date: string;
    serviceTimeId: number;
    eventType: string;
    notes: string | null;
  }) => {
    try {
      await createScheduleMutation.mutateAsync({
        date: data.date,
        service_time_id: data.serviceTimeId,
        lesson_id: lesson.id,
        event_type: data.eventType as any,
        notes: data.notes,
        is_cancelled: data.eventType === "cancelled",
      });

      successVibration();
      setIsScheduleDialogOpen(false);

      // Navigate to the newly scheduled lesson's detail page
      navigate({
        to: "/lesson/$lessonId",
        params: { lessonId: lesson.id.toString() },
        search: { date: data.date },
        replace: true,
      });
    } catch (error) {
      console.error("Failed to schedule lesson:", error);
    }
  };

  return (
    <div className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}>
      {/* Header */}
      <PageHeader
        onBack={onBack}
        title={lesson.name}
        sticky={true}
        variant="minimal"
      />

      <div className="max-w-4xl mx-auto p-5 pb-20">
        {/* Lesson Details Card */}
        <div
          className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-5 mb-5`}
        >
          {/* Series and Number */}
          {(lesson.curriculum_series || lesson.lesson_number) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {lesson.curriculum_series && (
                <span
                  className={`px-3 py-1 ${theme.backgrounds.primaryLighter} ${theme.text.primaryDark} rounded-lg font-semibold text-sm`}
                >
                  {lesson.curriculum_series}
                  {lesson.lesson_number ? ` ${lesson.lesson_number}` : ""}
                </span>
              )}

              {lesson.is_special_event && (
                <span
                  className={`px-3 py-1 ${theme.backgrounds.warning} ${theme.text.warning} rounded-lg font-semibold text-sm`}
                >
                  Evento Especial
                </span>
              )}
            </div>
          )}

          {/* Lesson Name */}
          <h2
            className={`text-2xl font-bold ${theme.text.neutralDarkest} mb-4`}
          >
            {lesson.name}
          </h2>

          {/* Resource URL */}
          {lesson.resource_url && (
            <a
              href={lesson.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 ${theme.backgrounds.primaryLight} ${theme.text.primary} rounded-xl text-sm font-semibold mb-4 hover:${theme.backgrounds.primary} hover:${theme.text.white} transition-colors`}
            >
              <ExternalLink className="w-4 h-4" />
              Ver Recurso
            </a>
          )}

          {/* Description */}
          {lesson.description && (
            <div className="mb-4">
              <h3
                className={`text-xs font-bold ${theme.text.neutralDarker} uppercase tracking-wide mb-2`}
              >
                Descrição
              </h3>
              <p
                className={`text-sm ${theme.text.neutralDark} leading-relaxed`}
              >
                {lesson.description}
              </p>
            </div>
          )}

          {/* Schedule Button */}
          <button
            onClick={() => setIsScheduleDialogOpen(true)}
            className={`w-full px-5 py-4 ${buttonClasses.primary} text-base flex items-center justify-center gap-2 mt-6`}
          >
            <Calendar className="w-5 h-5" />
            Agendar Lição
          </button>
        </div>

        {/* Info Box */}
        <div
          className={`${theme.backgrounds.primaryLighter} ${theme.borders.primaryLight} border rounded-2xl p-4`}
        >
          <p className={`text-sm ${theme.text.primaryDarker} leading-relaxed`}>
            Esta lição ainda não foi agendada. Escolha uma data e hora do culto
            para adicionar ao calendário.
          </p>
        </div>
      </div>

      {/* Schedule Dialog */}
      {isScheduleDialogOpen && (
        <ScheduleDialog
          lesson={lesson}
          onClose={() => setIsScheduleDialogOpen(false)}
          onSubmit={handleScheduleSubmit}
          isSubmitting={createScheduleMutation.isPending}
        />
      )}
    </div>
  );
}
