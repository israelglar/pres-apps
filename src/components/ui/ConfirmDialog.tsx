import { AlertTriangle, Loader2 } from 'lucide-react';
import { theme, buttonClasses } from '../../config/theme';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Confirm Dialog - Generic confirmation dialog
 *
 * A reusable confirmation dialog that can be used throughout the app
 * for any action that requires user confirmation.
 *
 * Variants:
 * - danger: Red color scheme (for deletions, destructive actions)
 * - warning: Amber color scheme (for warnings)
 * - info: Blue color scheme (for informational confirmations)
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
  loadingText = 'A processar...',
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      iconBg: theme.backgrounds.errorLight,
      iconText: theme.text.error,
      button: buttonClasses.danger,
    },
    warning: {
      iconBg: theme.backgrounds.warningLight,
      iconText: theme.text.warning,
      button: buttonClasses.primary,
    },
    info: {
      iconBg: theme.backgrounds.primaryLighter,
      iconText: theme.text.primary,
      button: buttonClasses.primary,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl max-w-md w-full p-5 animate-scale-in`}>
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className={`${styles.iconBg} p-3 rounded-full`}>
            <AlertTriangle className={`w-8 h-8 ${styles.iconText}`} />
          </div>
        </div>

        {/* Header */}
        <h2 className={`text-2xl font-bold ${theme.text.neutralDarker} mb-4 text-center`}>
          {title}
        </h2>

        {/* Message */}
        <p className={`${theme.text.neutral} text-sm text-center mb-6 whitespace-pre-line`}>
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-3 ${styles.button} text-sm flex items-center justify-center`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {loadingText}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
