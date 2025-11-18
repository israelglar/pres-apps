import { TeacherBadge } from '@/components/ui/TeacherBadge';
import type { ScheduleAssignment } from '@/types/database.types';

interface TeacherListProps {
  assignments?: (ScheduleAssignment & { teacher?: { name: string } })[];
  className?: string;
  emptyMessage?: string;
}

/**
 * TeacherList - Displays a list of teacher badges from schedule assignments
 * Handles wrapping gracefully on mobile devices
 */
export function TeacherList({
  assignments,
  className = '',
  emptyMessage = 'Nenhum professor atribuído'
}: TeacherListProps) {
  // Filter out assignments without teacher data
  const validAssignments = assignments?.filter(a => a.teacher?.name) || [];

  if (validAssignments.length === 0) {
    return (
      <span className="text-xs text-gray-500 italic">
        {emptyMessage}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {validAssignments.map((assignment) => (
        <TeacherBadge
          key={assignment.id}
          name={assignment.teacher!.name}
          role={assignment.role}
        />
      ))}
    </div>
  );
}
