import { ArrowRight, Edit3, ExternalLink } from "lucide-react";
import { buttonClasses, theme } from "../../../config/theme";

interface ActionButtonProps {
  hasAttendance: boolean;
  isFutureDate: boolean;
  selectedDate: Date;
  onContinue: () => void;
  onViewLesson?: (date: string) => void;
}

export function ActionButton({
  hasAttendance,
  isFutureDate,
  selectedDate,
  onContinue,
  onViewLesson,
}: ActionButtonProps) {
  const formatDateForUrl = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className={`flex-shrink-0 px-4 pb-4 pt-3 border-t ${theme.borders.neutralLight} ${theme.backgrounds.white}`}>
      {isFutureDate && onViewLesson ? (
        /* Future Date - Show "Ver Detalhes" button */
        <button
          onClick={() => onViewLesson(formatDateForUrl(selectedDate))}
          className={`w-full px-5 py-3 ${theme.backgrounds.white} ${theme.text.primary} border ${theme.borders.primary} hover:${theme.backgrounds.primaryLight} rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2`}
        >
          Ver Detalhes
          <ExternalLink className="w-4 h-4" />
        </button>
      ) : hasAttendance && onViewLesson ? (
        /* View/Edit Button - When attendance is marked */
        <button
          onClick={() => onViewLesson(formatDateForUrl(selectedDate))}
          className={`w-full px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center gap-2`}
        >
          Ver/Editar Presenças
          <Edit3 className="w-4 h-4" />
        </button>
      ) : (
        /* Continue Button - When attendance NOT marked */
        <button
          onClick={onContinue}
          className={`w-full px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center gap-2`}
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
