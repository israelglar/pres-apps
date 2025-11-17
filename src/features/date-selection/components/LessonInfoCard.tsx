import { AlertCircle, Calendar, ExternalLink } from "lucide-react";
import { theme } from "../../../config/theme";
import type { Schedule } from "../../../schemas/attendance.schema";

interface LessonInfoCardProps {
  selectedSchedule?: Schedule;
}

export function LessonInfoCard({ selectedSchedule }: LessonInfoCardProps) {
  return (
    <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-3`}>
      <p className={`text-xs ${theme.text.primary} font-bold uppercase tracking-wide mb-2 flex items-center gap-2`}>
        <Calendar className="w-4 h-4" />
        Lição
      </p>
      {selectedSchedule?.lesson ? (
        selectedSchedule.lesson.resource_url ? (
          <a
            href={selectedSchedule.lesson.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-bold ${theme.text.primaryDark} hover:underline flex items-center gap-2 transition-colors`}
          >
            {selectedSchedule.lesson.name}
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <p className={`text-sm font-bold ${theme.text.primaryDark}`}>
            {selectedSchedule.lesson.name}
          </p>
        )
      ) : (
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <p className="font-semibold text-sm">Sem lição agendada</p>
        </div>
      )}
    </div>
  );
}
