import { Clock, FileText, Edit3, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { theme } from '../../../config/theme';

interface QuickEditMenuProps {
  onSelectStatus: (status: 'late' | 'excused') => void;
  onOpenNotesDialog: () => void;
}

/**
 * Quick edit menu for changing status to Late/Excused or opening notes dialog
 */
export function QuickEditMenu({ onSelectStatus, onOpenNotesDialog }: QuickEditMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as any);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isOpen]);

  const menuOptions = [
    {
      id: 'late',
      label: 'Atrasado',
      icon: <Clock className="w-4 h-4" />,
      color: theme.status.late.text,
      onClick: () => {
        onSelectStatus('late');
        setIsOpen(false);
      },
    },
    {
      id: 'excused',
      label: 'Justificada',
      icon: <FileText className="w-4 h-4" />,
      color: theme.status.excused.text,
      onClick: () => {
        onSelectStatus('excused');
        setIsOpen(false);
      },
    },
    {
      id: 'notes',
      label: 'Editar com Notas...',
      icon: <Edit3 className="w-4 h-4" />,
      color: theme.text.primary,
      onClick: () => {
        onOpenNotesDialog();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent row tap event
          setIsOpen(!isOpen);
        }}
        className={`p-2 rounded-lg ${theme.text.neutral} hover:bg-gray-100 active:scale-95 transition-all`}
        aria-label="Mais opções"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 ${theme.backgrounds.white} rounded-lg shadow-lg border ${theme.borders.neutralLight} min-w-48 z-50 overflow-hidden`}
        >
          {menuOptions.map((option) => (
            <button
              key={option.id}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row tap event
                option.onClick();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors ${option.color}`}
            >
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
