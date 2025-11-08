/**
 * AbsenceAlertBanner Component
 * Displays a warning banner when a student has consecutive absences
 */

import { AlertTriangle, X } from 'lucide-react';
import type { AbsenceAlertBannerProps } from '../../types/absence-alerts.types';

/**
 * Banner component to alert teachers about students with consecutive absences
 *
 * @example
 * ```tsx
 * <AbsenceAlertBanner
 *   absenceCount={3}
 *   onDismiss={() => dismissAlert(studentId)}
 * />
 * ```
 */
export function AbsenceAlertBanner({
  absenceCount,
  onDismiss,
  className = '',
}: AbsenceAlertBannerProps) {
  return (
    <div
      className={`
        flex items-center gap-2
        bg-gradient-to-r from-amber-100 to-orange-100
        border-l-4 border-orange-500
        rounded-lg
        p-3
        ${className}
      `}
    >
      {/* Warning Icon */}
      <div className="flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-orange-600" />
      </div>

      {/* Alert Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-orange-900">
          {absenceCount} faltas recentes
        </p>
        <p className="text-xs text-orange-700 mt-0.5">
          Considera falar com ele/ela
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click handlers
          onDismiss();
        }}
        className="
          flex-shrink-0
          p-1
          rounded
          hover:bg-orange-200
          transition-colors
          focus:outline-none
          focus:ring-2
          focus:ring-orange-400
        "
        aria-label="Dispensar alerta"
      >
        <X className="w-4 h-4 text-orange-600" />
      </button>
    </div>
  );
}
