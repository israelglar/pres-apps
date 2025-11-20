import { theme } from "@/config/theme";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy } from "react";
import { z } from "zod";

const LessonDetailPage = lazy(() => import("../../features/lessons").then(m => ({ default: m.LessonDetailPage })));

// Define search params schema
const lessonDetailSearchSchema = z.object({
  date: z.string().optional(),
  serviceTimeId: z.number().optional(),
});

export const Route = createFileRoute("/_authenticated/lesson/$lessonId")({
  component: LessonDetailRoute,
  validateSearch: (search) => lessonDetailSearchSchema.parse(search),
});

function LessonDetailRoute() {
  const { lessonId } = Route.useParams();
  const { date, serviceTimeId } = Route.useSearch();
  const navigate = useNavigate();

  const handleBack = () => {
    // Use browser back navigation to avoid creating new history entry
    // and prevent unnecessary data reload
    window.history.back();
  };

  const handleViewStudent = (studentId: number) => {
    navigate({
      to: "/students/$studentId",
      params: { studentId: studentId.toString() },
    });
  };

  const handleRedoAttendance = (
    scheduleDate: string,
    serviceTimeId: number,
  ) => {
    navigate({
      to: "/search-marking",
      search: {
        date: scheduleDate,
        serviceTimeId: serviceTimeId,
      },
    });
  };

  const handleDateChange = (newDate: string) => {
    navigate({
      to: "/lesson/$lessonId",
      params: { lessonId },
      search: { date: newDate, serviceTimeId },
      replace: true,
    });
  };

  const handleServiceTimeChange = (newServiceTimeId: number) => {
    navigate({
      to: "/lesson/$lessonId",
      params: { lessonId },
      search: { date, serviceTimeId: newServiceTimeId },
      replace: true,
    });
  };

  // Validate lessonId is a number
  const parsedLessonId = parseInt(lessonId, 10);
  const isValidLessonId = !isNaN(parsedLessonId) && parsedLessonId > 0;

  if (!isValidLessonId) {
    return (
      <div
        className={`fixed inset-0 ${theme.solids.background} flex items-center justify-center`}
      >
        <div
          className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md text-center`}
        >
          <h2 className={`text-xl font-bold ${theme.text.neutralDarkest} mb-2`}>
            Lição Inválida
          </h2>
          <p className={`text-sm ${theme.text.neutral} mb-5`}>
            O identificador da lição não é válido.
          </p>
          <button
            onClick={handleBack}
            className={`px-5 py-3 ${theme.backgrounds.primary} ${theme.text.white} rounded-lg font-semibold ${theme.backgrounds.primaryActive} transition-all`}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <LessonDetailPage
      lessonId={parsedLessonId}
      selectedDate={date}
      initialServiceTimeId={serviceTimeId}
      onBack={handleBack}
      onViewStudent={handleViewStudent}
      onRedoAttendance={handleRedoAttendance}
      onDateChange={handleDateChange}
      onServiceTimeChange={handleServiceTimeChange}
    />
  );
}
