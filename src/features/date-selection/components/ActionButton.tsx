import { ArrowRight, Edit3 } from "lucide-react";
import { buttonClasses, theme } from "../../../config/theme";

interface ActionButtonProps {
  hasAttendance: boolean;
  onContinue: () => void;
  onViewHistory?: () => void;
}

export function ActionButton({
  hasAttendance,
  onContinue,
  onViewHistory,
}: ActionButtonProps) {
  return (
    <div className={`flex-shrink-0 p-5 border-t ${theme.borders.neutralLight} ${theme.backgrounds.white}`}>
      {hasAttendance ? (
        /* View/Edit Button - When attendance is marked */
        <button
          onClick={onViewHistory}
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
