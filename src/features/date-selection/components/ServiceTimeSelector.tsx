import { CheckCircle2, Clock } from "lucide-react";
import { theme } from "../../../config/theme";

interface ServiceTime {
  id: number;
  name: string;
  time: string;
}

interface ServiceTimeSelectorProps {
  serviceTimes: ServiceTime[];
  selectedServiceTimeId: number;
  getServiceTimeAttendanceStatus: (serviceTimeId: number) => boolean;
  onSelectServiceTime: (serviceTimeId: number) => void;
}

export function ServiceTimeSelector({
  serviceTimes,
  selectedServiceTimeId,
  getServiceTimeAttendanceStatus,
  onSelectServiceTime,
}: ServiceTimeSelectorProps) {
  return (
    <div
      className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-3`}
    >
      <p
        className={`text-xs ${theme.text.primary} font-bold uppercase tracking-wide mb-2 flex items-center gap-2`}
      >
        <Clock className="w-4 h-4" />
        Horário
      </p>
      <div className="flex gap-2">
        {serviceTimes.map((serviceTime) => {
          const hasAttendance = getServiceTimeAttendanceStatus(serviceTime.id);

          return (
            <button
              key={serviceTime.id}
              onClick={() => onSelectServiceTime(serviceTime.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border-2 transition-all ${
                selectedServiceTimeId === serviceTime.id
                  ? `${theme.borders.primary} ${theme.backgrounds.primaryLighter} shadow-md`
                  : `${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover}`
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  selectedServiceTimeId === serviceTime.id
                    ? theme.text.primary
                    : theme.text.neutral
                }`}
              />
              <span
                className={`font-bold text-sm ${
                  selectedServiceTimeId === serviceTime.id
                    ? theme.text.primaryDarker
                    : theme.text.neutralDarker
                }`}
              >
                {serviceTime.time.substring(0, 5)}
              </span>
              {hasAttendance && (
                <CheckCircle2 className={`w-3 h-3 ${theme.text.success}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
