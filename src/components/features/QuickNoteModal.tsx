import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { theme, buttonClasses, inputClasses } from '../../config/theme';

interface QuickNoteModalProps {
  studentName: string;
  currentNote?: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

const MAX_CHARS = 500;

/**
 * Quick Note Modal - Slide-up sheet for adding/editing student notes
 * Optimized for mobile with character limit and keyboard-friendly UX
 */
export function QuickNoteModal({
  studentName,
  currentNote = '',
  onClose,
  onSave,
}: QuickNoteModalProps) {
  const [note, setNote] = useState(currentNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when current note changes
  useEffect(() => {
    setNote(currentNote);
  }, [currentNote]);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    // Small delay to allow modal animation to start
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNote = note.trim();
    onSave(trimmedNote);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const remainingChars = MAX_CHARS - note.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-5 flex items-center justify-between sticky top-0 z-10 rounded-t-3xl`}>
          <div>
            <h2 className={`text-xl font-bold ${theme.text.onPrimaryButton}`}>Adicionar Nota</h2>
            <p className={`text-sm ${theme.text.onPrimaryButton} opacity-90 mt-0.5`}>{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className={`w-6 h-6 ${theme.text.onPrimaryButton}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Notes Textarea */}
          <div>
            <label
              htmlFor="quick-note"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
            >
              Observações
            </label>
            <textarea
              ref={textareaRef}
              id="quick-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full px-4 py-3 ${inputClasses} resize-none text-sm ${
                isOverLimit ? 'border-red-500 focus:border-red-500' : ''
              }`}
              rows={4}
              placeholder="Observações (visitante, seguimento, comportamento...)"
              maxLength={MAX_CHARS}
              onKeyDown={(e) => {
                // Submit on Cmd/Ctrl + Enter
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className={`text-xs ${theme.text.neutral}`}>
                Cmd/Ctrl + Enter para guardar
              </p>
              <p
                className={`text-xs ${
                  isOverLimit
                    ? theme.text.error
                    : remainingChars < 50
                    ? theme.text.warning
                    : theme.text.neutral
                }`}
              >
                {remainingChars} caracteres restantes
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm`}
              disabled={isOverLimit}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
