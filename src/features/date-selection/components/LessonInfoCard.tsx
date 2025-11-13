import { AlertCircle, Calendar, ExternalLink } from "lucide-react";
import { theme } from "../../../config/theme";
import type { Schedule } from "../../../schemas/attendance.schema";

interface LessonInfoCardProps {
  selectedSchedule?: Schedule;
}

export function LessonInfoCard({ selectedSchedule }: LessonInfoCardProps) {
  return (
    <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-4`}>
      <label
        className={`block ${theme.text.primary} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
      >
        <Calendar className="w-4 h-4" />
        Lição
      </label>
      {selectedSchedule?.lesson ? (
        selectedSchedule.lesson.resource_url ? (
          <a
            href={selectedSchedule.lesson.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.text.primaryDark} font-semibold text-base ${theme.text.primaryDarker} hover:underline flex items-center gap-2 transition-colors`}
          >
            {selectedSchedule.lesson.name}
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <p className={`${theme.text.primaryDark} font-semibold text-base`}>
            {selectedSchedule.lesson.name}
          </p>
        )
      ) : (
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <p className="font-semibold text-base">Sem lição agendada</p>
        </div>
      )}
    </div>
  );
}
