import { X, Loader2, Check, XIcon, Clock, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { theme, buttonClasses, inputClasses } from '../../../config/theme';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';

interface EditAttendanceDialogProps {
  record: AttendanceRecordWithRelations;
  onClose: () => void;
  onSubmit: (recordId: number, status: 'present' | 'absent' | 'excused' | 'late', notes?: string) => void;
  isSubmitting: boolean;
}

/**
 * Edit Attendance Dialog - Edit a single attendance record
 *
 * Allows editing:
 * - Status (Present/Absent/Late/Excused)
 * - Notes (optional observations)
 */
export function EditAttendanceDialog({
  record,
  onClose,
  onSubmit,
  isSubmitting,
}: EditAttendanceDialogProps) {
  const [status, setStatus] = useState<'present' | 'absent' | 'excused' | 'late'>(record.status);
  const [notes, setNotes] = useState(record.notes || '');

  // Reset form when record changes
  useEffect(() => {
    setStatus(record.status);
    setNotes(record.notes || '');
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(record.id, status, notes.trim() || undefined);
  };

  // Format date for display
  const formattedDate = new Date(record.schedule?.date || '').toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Status options with icons
  const statusOptions = [
    {
      value: 'present',
      label: 'Presente',
      icon: <Check className="w-5 h-5" />,
      color: theme.status.present.text,
      bgColor: theme.status.present.bg,
      borderColor: theme.status.present.border,
    },
    {
      value: 'absent',
      label: 'Falta',
      icon: <XIcon className="w-5 h-5" />,
      color: theme.status.absent.text,
      bgColor: theme.status.absent.bg,
      borderColor: theme.status.absent.border,
    },
    {
      value: 'late',
      label: 'Atrasado',
      icon: <Clock className="w-5 h-5" />,
      color: theme.status.late.text,
      bgColor: theme.status.late.bg,
      borderColor: theme.status.late.border,
    },
    {
      value: 'excused',
      label: 'Justificada',
      icon: <FileText className="w-5 h-5" />,
      color: theme.status.excused.text,
      bgColor: theme.status.excused.bg,
      borderColor: theme.status.excused.border,
    },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className={`${theme.solids.background} p-5 flex items-center justify-between sticky top-0 z-10`}>
          <h2 className="text-2xl font-bold text-white">Editar Presença</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Student Info */}
          <div className={`p-4 rounded-xl ${theme.solids.cardHighlight} border ${theme.borders.primary}`}>
            <p className={`text-sm font-semibold ${theme.text.neutralDark} mb-1`}>Pré</p>
            <p className={`text-lg font-bold ${theme.text.neutralDarker}`}>{record.student?.name || 'Unknown'}</p>
            <p className={`text-sm ${theme.text.neutral} mt-1`}>{formattedDate}</p>
            {record.schedule?.lesson?.name && (
              <p className={`text-sm ${theme.text.neutral}`}>{record.schedule.lesson.name}</p>
            )}
            {record.schedule?.service_time?.time && (
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-bold ${theme.text.primary} ${theme.backgrounds.primaryLighter} rounded-md`}>
                {record.schedule.service_time.time}
              </span>
            )}
          </div>

          {/* Status Selection */}
          <div>
            <label className={`block ${theme.text.neutralDarker} font-bold mb-3 text-xs`}>
              Estado <span className={theme.text.error}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  disabled={isSubmitting}
                  className={`
                    p-3 rounded-xl border-2 transition-all
                    ${status === option.value
                      ? `${option.bgColor} ${option.borderColor} ${option.color} font-bold shadow-md`
                      : `${theme.backgrounds.white} ${theme.borders.neutralLight} ${theme.text.neutralDark} ${theme.backgrounds.neutralHover}`
                    }
                    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={status === option.value ? option.color : theme.text.neutralLight}>
                      {option.icon}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div>
            <label
              htmlFor="notes"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
            >
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-3 ${inputClasses} resize-none text-sm`}
              rows={3}
              placeholder="Observações (ex: Chegou atrasado por causa do trânsito)"
              disabled={isSubmitting}
            />
            <p className={`text-xs ${theme.text.neutralMedium} mt-1`}>
              Adiciona contexto sobre a presença do pré
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center gap-2`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
