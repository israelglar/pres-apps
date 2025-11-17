import { theme } from '../../../config/theme';

interface StatusGroupSeparatorProps {
  count: number;
}

/**
 * Visual separator between present and absent student groups
 * Shows count of absent students
 */
export function StatusGroupSeparator({ count }: StatusGroupSeparatorProps) {
  const label = count === 1 ? '1 Falta' : `${count} Faltas`;

  return (
    <div className="flex items-center gap-3 my-4">
      <div className={`flex-1 h-px ${theme.backgrounds.neutralLight}`} />
      <span className={`text-xs font-medium ${theme.text.neutralMedium} uppercase tracking-wide`}>
        {label}
      </span>
      <div className={`flex-1 h-px ${theme.backgrounds.neutralLight}`} />
    </div>
  );
}
