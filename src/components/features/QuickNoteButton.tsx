import { FileText } from 'lucide-react';
import { theme } from '../../config/theme';

interface QuickNoteButtonProps {
  hasNote: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Quick Note Button - Small icon button for adding/editing notes
 * Shows outline icon when no note, filled when note exists
 * Uses div instead of button to avoid nesting issues (parent is already a button)
 */
export function QuickNoteButton({ hasNote, onClick, className = '' }: QuickNoteButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        onClick();
      }}
      onKeyDown={(e) => {
        // Handle Enter and Space keys for accessibility
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
        hasNote
          ? `${theme.backgrounds.primaryLighter} ${theme.text.primary} hover:${theme.backgrounds.primaryLight}`
          : `${theme.backgrounds.neutralHover} ${theme.text.neutral} hover:${theme.text.neutralDark}`
      } ${className}`}
      aria-label={hasNote ? 'Editar nota' : 'Adicionar nota'}
      title={hasNote ? 'Editar nota' : 'Adicionar nota'}
    >
      <FileText className="w-4 h-4" fill={hasNote ? 'currentColor' : 'none'} />
    </div>
  );
}
