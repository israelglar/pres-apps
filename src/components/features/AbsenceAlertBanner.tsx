/**
 * AbsenceAlertBanner Component
 * Displays a warning banner when a student has consecutive absences
 */

import { AlertTriangle, X } from 'lucide-react';
import { theme } from '../../config/theme';
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
        ${theme.backgrounds.warning}
        border-l-4 ${theme.borders.warning}
        rounded-lg
        p-3
        ${className}
      `}
    >
      {/* Warning Icon */}
      <div className="flex-shrink-0">
        <AlertTriangle className={`w-4 h-4 ${theme.text.warning}`} />
      </div>

      {/* Alert Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${theme.text.warning}`}>
          {absenceCount} faltas recentes
        </p>
        <p className={`text-xs ${theme.text.warning} mt-0.5`}>
          Considera falar com ele/ela
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click handlers
          onDismiss();
        }}
        className={`
          flex-shrink-0
          p-1
          rounded
          ${theme.backgrounds.warningLight}
          transition-colors
          focus:outline-none
          focus:ring-2
          focus:ring-amber-400
        `}
        aria-label="Dispensar alerta"
      >
        <X className={`w-4 h-4 ${theme.text.warning}`} />
      </button>
    </div>
  );
}
