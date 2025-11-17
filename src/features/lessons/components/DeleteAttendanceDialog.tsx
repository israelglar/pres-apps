import { AlertTriangle, Loader2 } from 'lucide-react';
import { theme, buttonClasses } from '../../../config/theme';

interface DeleteAttendanceDialogProps {
  studentName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/**
 * Delete Attendance Dialog - Confirms removing a student's attendance record
 */
export function DeleteAttendanceDialog({
  studentName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteAttendanceDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 animate-scale-in">
        {/* Warning Icon */}
        <div className="flex justify-center mb-3">
          <div className={`${theme.backgrounds.error} p-3 rounded-full`}>
            <AlertTriangle className={`w-6 h-6 ${theme.text.error}`} />
          </div>
        </div>

        {/* Header */}
        <h2 className={`text-xl font-bold ${theme.text.neutralDarker} mb-2 text-center`}>
          Remover Registo?
        </h2>

        {/* Message */}
        <p className={`${theme.text.neutral} text-sm text-center mb-2`}>
          Tens a certeza que queres remover o registo de:
        </p>
        <p className={`text-base font-bold ${theme.text.primaryDarker} text-center mb-5`}>
          {studentName}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-3 ${buttonClasses.danger} text-sm flex items-center justify-center`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A remover...
              </>
            ) : (
              'Remover'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
