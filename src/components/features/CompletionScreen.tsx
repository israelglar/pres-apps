import { CheckCircle, Loader2, Users, UserCheck, UserPlus } from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";

interface CompletionScreenProps {
  lessonName: string;
  presentCount: number;
  lateCount?: number;
  excusedCount?: number;
  visitorsCount?: number;
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
  onConfirm,
  onGoBack,
  isLoading = false,
}: CompletionScreenProps) {
  // Calculate total as everyone who attended (present + late + excused + visitors)
  const totalCount = presentCount + lateCount + excusedCount + visitorsCount;

  return (
    <div
      className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}
    >
      <div className="max-w-md w-full text-center">
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 md:p-12`}>
          <div
            className={`w-20 h-20 md:w-24 md:h-24 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <CheckCircle
              className={`w-12 h-12 md:w-16 md:h-16 ${theme.text.primary}`}
            />
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold ${theme.text.neutralDarker} mb-4`}>
            Confirmar Presenças?
          </h2>
          <p className={`${theme.text.neutral} mb-6 md:mb-8 text-sm md:text-base`}>
            {lessonName}
          </p>
          <div className="flex justify-center gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="text-center">
              <div className={`w-12 h-12 md:w-14 md:h-14 ${theme.backgrounds.neutral} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <Users className={`w-6 h-6 md:w-7 md:h-7 ${theme.text.neutral}`} />
              </div>
              <div
                className={`text-3xl md:text-4xl font-bold ${theme.text.neutralDarker} mb-1`}
              >
                {totalCount}
              </div>
              <div
                className={`text-xs md:text-sm ${theme.text.neutral} font-medium`}
              >
                Total
              </div>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 md:w-14 md:h-14 ${theme.status.present.bgMedium} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <UserCheck className={`w-6 h-6 md:w-7 md:h-7 ${theme.status.present.text}`} />
              </div>
              <div
                className={`text-3xl md:text-4xl font-bold ${theme.status.present.text} mb-1`}
              >
                {presentCount}
              </div>
              <div
                className={`text-xs md:text-sm ${theme.text.neutral} font-medium`}
              >
                Presentes
              </div>
            </div>
            {visitorsCount > 0 && (
              <div className="text-center">
                <div className={`w-12 h-12 md:w-14 md:h-14 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <UserPlus className={`w-6 h-6 md:w-7 md:h-7 ${theme.text.primary}`} />
                </div>
                <div
                  className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-1`}
                >
                  {visitorsCount}
                </div>
                <div
                  className={`text-xs md:text-sm ${theme.text.neutral} font-medium`}
                >
                  Visitantes
                </div>
              </div>
            )}
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
