import { Clock } from "lucide-react";
import { theme } from "../../config/theme";

interface ServiceTimeInfo {
  id: number;
  time: string; // e.g., "11:00:00" or "11:00"
  name: string; // e.g., "9h" or "11h"
}

interface ServiceTimeBadgesProps {
  serviceTimes: ServiceTimeInfo[];
  variant?: "compact" | "detailed";
  showIcon?: boolean;
}

/**
 * Shared component for displaying service time badges
 * Used by DateGroupCard and AttendanceRecordCard
 *
 * Compact variant: Small badges with icon and time (9h, 11h)
 * Detailed variant: Larger badges with formatted time display
 */
export function ServiceTimeBadges({
  serviceTimes,
  variant = "compact",
  showIcon = true,
}: ServiceTimeBadgesProps) {
  if (serviceTimes.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {serviceTimes.map((serviceTime) => {
        // Format time for display
        const displayTime = serviceTime.name || serviceTime.time.slice(0, 5);

        if (variant === "compact") {
          return (
            <div
              key={serviceTime.id}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${theme.backgrounds.primaryLight} ${theme.text.primaryDark} text-xs font-semibold`}
            >
              {showIcon && <Clock className="w-3 h-3" />}
              <span>{displayTime}</span>
            </div>
          );
        }

        // Detailed variant
        return (
          <span
            key={serviceTime.id}
            className={`px-2 py-0.5 text-xs font-bold ${theme.backgrounds.primaryLight} ${theme.text.primaryDark} rounded shadow-sm`}
          >
            {showIcon && <Clock className="w-3 h-3 inline mr-0.5" />}
            {displayTime}
          </span>
        );
      })}
    </div>
  );
}
