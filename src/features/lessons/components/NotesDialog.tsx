import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { theme, buttonClasses, inputClasses } from '../../../config/theme';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';

interface NotesDialogProps {
  record: AttendanceRecordWithRelations;
  onClose: () => void;
  onSubmit: (recordId: number, notes: string) => void;
  isSubmitting: boolean;
}

/**
 * Notes Dialog - Edit only the notes for an attendance record
 * Status remains unchanged
 */
export function NotesDialog({
  record,
  onClose,
  onSubmit,
  isSubmitting,
}: NotesDialogProps) {
  const [notes, setNotes] = useState(record.notes || '');

  // Reset form when record changes
  useEffect(() => {
    setNotes(record.notes || '');
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(record.id, notes.trim());
  };

  // Format date for display
  const formattedDate = new Date(record.schedule?.date || '').toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-5 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl`}>
          <h2 className={`text-2xl font-bold ${theme.text.onPrimaryButton}`}>Adicionar Notas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className={`w-6 h-6 ${theme.text.onPrimaryButton}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Student Info */}
          <div className={`p-4 rounded-xl ${theme.solids.cardHighlight} border ${theme.borders.primary}`}>
            <p className={`text-lg font-bold ${theme.text.neutralDarker}`}>{record.student?.name || 'Unknown'}</p>
            <p className={`text-sm ${theme.text.neutral} mt-1`}>{formattedDate}</p>
            {record.schedule?.lesson?.name && (
              <p className={`text-sm ${theme.text.neutral}`}>{record.schedule.lesson.name}</p>
            )}
            {record.schedule?.service_time?.time && (
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-bold ${theme.text.primary} ${theme.backgrounds.primaryLighter} rounded-md`}>
                {record.schedule.service_time.time.slice(0, 5)}
              </span>
            )}
          </div>

          {/* Notes Textarea */}
          <div>
            <label
              htmlFor="notes"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
            >
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-3 ${inputClasses} resize-none text-sm`}
              rows={4}
              placeholder="Observações (ex: Chegou atrasado por causa do trânsito)"
              disabled={isSubmitting}
              autoFocus
            />
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
