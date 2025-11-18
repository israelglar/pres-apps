import { createFileRoute } from '@tanstack/react-router';
import { UnscheduledLessonPage } from '../../features/lessons/UnscheduledLessonPage';
import { theme } from '@/config/theme';
import { useQuery } from '@tanstack/react-query';
import { getLessonById } from '../../api/supabase/lessons';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/lessons/$lessonId')({
  component: UnscheduledLessonRoute,
});

function UnscheduledLessonRoute() {
  const { lessonId } = Route.useParams();

  // Parse lessonId to number
  const lessonIdNum = parseInt(lessonId, 10);

  // Fetch lesson data
  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lesson', lessonIdNum],
    queryFn: () => getLessonById(lessonIdNum),
    enabled: !isNaN(lessonIdNum),
  });

  const handleBack = () => {
    // Use browser back navigation to avoid creating new history entry
    // and prevent navigation loops with parent/child routes
    window.history.back();
  };

  // Handle invalid lesson ID
  if (isNaN(lessonIdNum)) {
    return (
      <div
        className={`fixed inset-0 ${theme.solids.background} flex items-center justify-center`}
      >
        <div
          className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md text-center`}
        >
          <h2 className={`text-xl font-bold ${theme.text.neutralDarkest} mb-2`}>
            ID Inválido
          </h2>
          <p className={`text-sm ${theme.text.neutral} mb-5`}>
            O ID da lição fornecido não é válido.
          </p>
          <button
            onClick={handleBack}
            className={`px-5 py-3 ${theme.backgrounds.primary} ${theme.text.white} rounded-lg font-semibold ${theme.backgrounds.primaryHover} transition-all`}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div
        className={`fixed inset-0 ${theme.solids.background} flex items-center justify-center`}
      >
        <Loader2
          className={`w-12 h-12 ${theme.text.primary} animate-spin`}
        />
      </div>
    );
  }

  // Handle error or lesson not found
  if (error || !lesson) {
    return (
      <div
        className={`fixed inset-0 ${theme.solids.background} flex items-center justify-center`}
      >
        <div
          className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md text-center`}
        >
          <h2 className={`text-xl font-bold ${theme.text.neutralDarkest} mb-2`}>
            Lição Não Encontrada
          </h2>
          <p className={`text-sm ${theme.text.neutral} mb-5`}>
            A lição solicitada não foi encontrada no sistema.
          </p>
          <button
            onClick={handleBack}
            className={`px-5 py-3 ${theme.backgrounds.primary} ${theme.text.white} rounded-lg font-semibold ${theme.backgrounds.primaryHover} transition-all`}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <UnscheduledLessonPage lesson={lesson} onBack={handleBack} />;
}
