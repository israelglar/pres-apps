import { Clock, FileText, Edit3, MoreVertical, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { theme } from '../../../config/theme';

interface QuickEditMenuProps {
  onSelectStatus: (status: 'late' | 'excused') => void;
  onOpenNotesDialog: () => void;
  onOpenDeleteDialog: () => void;
}

/**
 * Quick edit menu for changing status to Late/Excused, opening notes dialog, or deleting record
 */
export function QuickEditMenu({ onSelectStatus, onOpenNotesDialog, onOpenDeleteDialog }: QuickEditMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if menu should open upward when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;

      // Menu height: 4 items × ~52px (py-3 + content) + padding + borders + shadow buffer
      // Using 300px to be conservative and catch more items near the bottom
      const menuHeight = 300;

      // Add extra buffer (80px) to ensure we catch items that are close to bottom
      // This ensures the last 3-4 items will open upward
      const safetyBuffer = 80;

      // If not enough space below (including safety buffer), open upward
      setOpenUpward(spaceBelow < (menuHeight + safetyBuffer));
    }
  }, [isOpen]);

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
      label: 'Editar notas',
      icon: <Edit3 className="w-4 h-4" />,
      color: theme.text.primary,
      onClick: () => {
        onOpenNotesDialog();
        setIsOpen(false);
      },
    },
    {
      id: 'delete',
      label: 'Remover',
      icon: <Trash2 className="w-4 h-4" />,
      color: theme.text.error,
      onClick: () => {
        onOpenDeleteDialog();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        ref={buttonRef}
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
          className={`absolute right-0 ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${theme.backgrounds.white} rounded-lg shadow-2xl border ${theme.borders.neutralLight} min-w-48 z-[9999] overflow-hidden`}
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
