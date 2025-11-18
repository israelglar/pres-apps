import { CheckCircle2, Clock } from "lucide-react";
import { theme } from "../../../config/theme";
import { TeacherList } from "../../../components/features/TeacherList";
import type { ScheduleAssignment } from "../../../types/database.types";

interface ServiceTime {
  id: number;
  name: string;
  time: string;
}

interface ServiceTimeSelectorProps {
  serviceTimes: ServiceTime[];
  selectedServiceTimeId: number;
  getServiceTimeAttendanceStatus: (serviceTimeId: number) => boolean;
  getServiceTimeAssignments?: (serviceTimeId: number) => (ScheduleAssignment & { teacher?: { name: string } })[];
  onSelectServiceTime: (serviceTimeId: number) => void;
}

export function ServiceTimeSelector({
  serviceTimes,
  selectedServiceTimeId,
  getServiceTimeAttendanceStatus,
  getServiceTimeAssignments,
  onSelectServiceTime,
}: ServiceTimeSelectorProps) {
  return (
    <div
      className={`${theme.backgrounds.white} rounded-xl border ${theme.borders.primaryLight} shadow-md p-3`}
    >
      <p
        className={`text-xs ${theme.text.primary} font-bold uppercase tracking-wide mb-2 flex items-center gap-2`}
      >
        <Clock className="w-4 h-4" />
        Horário
      </p>
      <div className="space-y-3">
        {serviceTimes.map((serviceTime) => {
          const hasAttendance = getServiceTimeAttendanceStatus(serviceTime.id);
          const assignments = getServiceTimeAssignments?.(serviceTime.id) || [];

          return (
            <div key={serviceTime.id} className="space-y-2">
              <button
                onClick={() => onSelectServiceTime(serviceTime.id)}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border transition-all ${
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

              {/* Teacher Badges */}
              {assignments.length > 0 && (
                <div className="pl-1">
                  <TeacherList assignments={assignments} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
