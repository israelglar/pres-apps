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
  const [viewportHeight, setViewportHeight] = useState(
    window.visualViewport?.height || window.innerHeight
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when current note changes
  useEffect(() => {
    setNote(currentNote);
  }, [currentNote]);

  // Auto-focus textarea and handle mobile keyboard
  useEffect(() => {
    // Small delay to allow modal animation to start
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    // Handle keyboard opening on mobile - scroll textarea into view
    const handleViewportResize = () => {
      if (window.visualViewport) {
        // Update backdrop height to match visible viewport
        setViewportHeight(window.visualViewport.height);

        // Scroll the textarea into view with some offset
        if (textareaRef.current) {
          setTimeout(() => {
            textareaRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }, 100);
        }
      }
    };

    // Listen for visualViewport resize (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      clearTimeout(timer);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in overflow-hidden"
      onClick={handleBackdropClick}
      style={{
        // Use visualViewport height (accounts for keyboard)
        height: `${viewportHeight}px`,
      }}
    >
      <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-slide-up" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-4 flex items-center justify-between flex-shrink-0 rounded-t-3xl`}>
          <div>
            <h2 className={`text-lg font-bold ${theme.text.onPrimaryButton}`}>Adicionar Nota</h2>
            <p className={`text-sm ${theme.text.onPrimaryButton} opacity-90`}>{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className={`w-6 h-6 ${theme.text.onPrimaryButton}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-2.5 flex-shrink-0">
          {/* Notes Textarea */}
          <div>
            <label
              htmlFor="quick-note"
              className={`block ${theme.text.neutralDarker} font-bold mb-1.5 text-xs`}
            >
              Observações
            </label>
            <textarea
              ref={textareaRef}
              id="quick-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full px-4 py-2.5 ${inputClasses} resize-none text-sm ${
                isOverLimit ? 'border-red-500 focus:border-red-500' : ''
              }`}
              rows={2}
              placeholder="Observações (visitante, seguimento, comportamento...)"
              maxLength={MAX_CHARS}
              onKeyDown={(e) => {
                // Submit on Cmd/Ctrl + Enter
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="flex justify-end items-center mt-1">
              <p
                className={`text-xs ${
                  isOverLimit
                    ? theme.text.error
                    : remainingChars < 50
                    ? theme.text.warning
                    : theme.text.neutral
                }`}
              >
                {remainingChars} / {MAX_CHARS}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 ${buttonClasses.secondary} text-sm`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2.5 ${buttonClasses.primary} text-sm`}
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
