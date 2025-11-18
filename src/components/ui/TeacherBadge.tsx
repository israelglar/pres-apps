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

  // Use lighter colors with less rounded corners
  const bgColor = role === 'assistant'
    ? theme.backgrounds.secondaryLight100
    : theme.backgrounds.primaryLight;

  const textColor = role === 'assistant'
    ? theme.text.secondaryDark
    : theme.text.primaryDark;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor} ${className}`}
      title={name} // Full name on hover
    >
      {firstName}
    </span>
  );
}
