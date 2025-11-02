import { AlertTriangle, Loader2 } from 'lucide-react';
import { theme, buttonClasses } from '../../config/theme';

interface DeleteConfirmDialogProps {
  studentName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/**
 * Delete Confirmation Dialog - Confirms student deletion
 *
 * Shows:
 * - Warning message
 * - Student name to be deleted
 * - Confirm and Cancel buttons
 */
export function DeleteConfirmDialog({
  studentName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className={`${theme.backgrounds.error} p-3 rounded-full`}>
            <AlertTriangle className={`w-8 h-8 ${theme.text.error}`} />
          </div>
        </div>

        {/* Header */}
        <h2 className={`text-2xl font-bold ${theme.text.neutralDarker} mb-2 text-center`}>
          Eliminar Aluno?
        </h2>

        {/* Message */}
        <p className={`${theme.text.neutral} text-center mb-2`}>
          Tens a certeza que queres eliminar o aluno:
        </p>
        <p className={`text-lg font-bold ${theme.text.primaryDarker} text-center mb-4`}>
          {studentName}
        </p>
        <p className={`text-sm ${theme.text.neutral} text-center mb-6`}>
          Esta ação não pode ser revertida. O aluno será marcado como inativo.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-base`}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-3 ${buttonClasses.danger} text-base flex items-center justify-center`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A eliminar...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
