import { CheckCircle } from 'lucide-react';

interface CompletionScreenProps {
  lessonName: string;
  presentCount: number;
  absentCount: number;
}

/**
 * Shared completion screen shown after attendance is marked
 * Used by both swipe and search marking pages
 */
export function CompletionScreen({
  lessonName,
  presentCount,
  absentCount,
}: CompletionScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Presenças Registadas!
          </h2>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            {lessonName}
          </p>
          <div className="flex justify-center gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                {presentCount}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">
                Presentes
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-red-600 mb-1">
                {absentCount}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">
                Faltas
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-xs md:text-sm">
            A regressar ao início...
          </p>
        </div>
      </div>
    </div>
  );
}
