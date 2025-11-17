import { Filter } from "lucide-react";
import { theme } from "../../config/theme";

interface FilterButtonProps {
  isActive: boolean; // Has active filters (shows dot indicator)
  isOpen: boolean; // Panel is currently open
  onClick: () => void;
  label?: string; // Optional label text (default: just icon)
  className?: string;
}

/**
 * FilterButton Component
 * Toggle button with filter icon and active indicator
 */
export function FilterButton({
  isActive,
  isOpen,
  onClick,
  label,
  className = "",
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
        isOpen || isActive
          ? `${theme.solids.primaryButton} ${theme.text.onPrimaryButton} shadow-md`
          : `${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primary} hover:shadow-md`
      } ${className}`}
    >
      <Filter className="w-4 h-4" />
      {label && <span>{label}</span>}
      {isActive && (
        <span className={`w-2 h-2 ${theme.backgrounds.white} rounded-full`} />
      )}
    </button>
  );
}
