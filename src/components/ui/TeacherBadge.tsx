import { theme } from '@/config/theme';

interface TeacherBadgeProps {
  name: string;
  role?: 'lead' | 'teacher' | 'assistant';
  className?: string;
}

/**
 * Extracts the first name from a full name
 * Example: "Israel Barreto" → "Israel"
 */
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName;
}

/**
 * TeacherBadge - Displays a teacher's first name as a colored badge
 * Used throughout the app to show teacher assignments
 */
export function TeacherBadge({ name, role, className = '' }: TeacherBadgeProps) {
  const firstName = getFirstName(name);

  // Use primary color for lead teachers, secondary for assistants
  const bgColor = role === 'assistant'
    ? theme.backgrounds.secondary
    : theme.backgrounds.primary;

  const textColor = role === 'assistant'
    ? theme.text.onSecondary
    : theme.text.onPrimary;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}
      title={name} // Full name on hover
    >
      {firstName}
    </span>
  );
}
