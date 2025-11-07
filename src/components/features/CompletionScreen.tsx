import { CheckCircle, Loader2 } from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";

interface CompletionScreenProps {
  lessonName: string;
  presentCount: number;
  absentCount: number;
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
  absentCount,
  onConfirm,
  onGoBack,
  isLoading = false,
}: CompletionScreenProps) {
  return (
    <div
      className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}
    >
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <CheckCircle
              className={`w-12 h-12 md:w-16 md:h-16 ${theme.text.primary}`}
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Confirmar Presenças?
          </h2>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            {lessonName}
          </p>
          <div className="flex justify-center gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="text-center">
              <div
                className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-1`}
              >
                {presentCount}
              </div>
              <div
                className={`text-xs md:text-sm ${theme.text.neutral} font-medium`}
              >
                Presentes
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-3xl md:text-4xl font-bold ${theme.text.error} mb-1`}
              >
                {absentCount}
              </div>
              <div
                className={`text-xs md:text-sm ${theme.text.neutral} font-medium`}
              >
                Faltas
              </div>
            </div>
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
