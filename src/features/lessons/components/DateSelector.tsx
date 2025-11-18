import { ChevronDown } from 'lucide-react';
import { theme } from '../../../config/theme';

interface DateSelectorProps {
  availableDates: string[];
  currentDate: string;
  onDateChange: (date: string) => void;
}

/**
 * Date Selector Component
 * Dropdown selector for switching between different dates for the same lesson
 * Only displayed when multiple dates are available
 */
export function DateSelector({
  availableDates,
  currentDate,
  onDateChange,
}: DateSelectorProps) {
  // Don't render if there's only one date
  if (availableDates.length <= 1) {
    return null;
  }

  // Format date for display (short format: "10 nov 2025")
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00'); // Avoid timezone issues
    const day = d.getDate();
    const monthNames = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
      <span className={`${theme.text.onLightSecondary} text-xs font-medium whitespace-nowrap`}>
        Data:
      </span>
      <div className="relative flex-1">
        <select
          value={currentDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={`w-full appearance-none px-3 py-2 pr-8 ${theme.backgrounds.neutralLight} ${theme.text.onLight} rounded-lg text-xs font-medium border ${theme.borders.neutralLight} focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer`}
        >
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.text.neutral} pointer-events-none`}
        />
      </div>
    </div>
  );
}
