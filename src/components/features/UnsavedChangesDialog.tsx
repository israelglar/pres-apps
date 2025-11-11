/**
 * Unsaved Changes Dialog Component
 * Shows a confirmation dialog when user tries to leave with unsaved attendance data
 */

import React from 'react';
import { buttonClasses, theme } from '../../config/theme';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onLeave: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onContinue,
  onLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl max-w-md w-full p-5 animate-in fade-in zoom-in duration-200`}>
        <div className="text-center mb-6">
          <div className={`w-16 h-16 ${theme.backgrounds.warning} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg
              className={`w-8 h-8 ${theme.text.warning}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className={`text-base font-bold ${theme.text.neutralDarker} mb-2`}>
            Tem a certeza?
          </h3>
          <p className={`${theme.text.neutral} text-sm`}>
            Tem registos de presença por guardar. Se sair agora, perderá
            todo o progresso.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
          >
            Continuar a Marcar
          </button>
          <button
            onClick={onLeave}
            className={`flex-1 px-5 py-3 ${buttonClasses.danger} text-sm`}
          >
            Sair Sem Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
