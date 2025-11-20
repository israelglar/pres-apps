import { useState, useEffect, useRef, useMemo } from 'react';
import { TeacherBadge } from '@/components/ui/TeacherBadge';
import { theme } from '@/config/theme';
import type { ScheduleAssignment } from '@/types/database.types';

interface TeacherListProps {
  assignments?: (ScheduleAssignment & { teacher?: { name: string } })[];
  className?: string;
  emptyMessage?: string;
}

/**
 * TeacherList - Displays a list of teacher badges from schedule assignments
 * Shows overflow badge (+X) when teachers don't fit in one line
 */
export function TeacherList({
  assignments,
  className = '',
  emptyMessage = 'Nenhum professor atribuído'
}: TeacherListProps) {
  // Filter and sort assignments - memoized to prevent re-render loops
  const sortedAssignments = useMemo(() => {
    const validAssignments = assignments?.filter(a => a.teacher?.name) || [];
    return [...validAssignments].sort((a, b) => {
      const nameA = a.teacher?.name || '';
      const nameB = b.teacher?.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [assignments]);

  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0);

  useEffect(() => {
    const calculateVisibleBadges = () => {
      if (!containerRef.current || sortedAssignments.length === 0) {
        setVisibleCount(sortedAssignments.length);
        return;
      }

      const containerWidth = containerRef.current.offsetWidth;
      const gap = 8; // gap-2 = 0.5rem = 8px
      const overflowBadgeWidth = 50; // Approximate width of "+X" badge

      const availableWidth = containerWidth;
      let count = 0;
      let totalWidth = 0;

      for (let i = 0; i < badgeRefs.current.length; i++) {
        const badgeElement = badgeRefs.current[i];
        if (!badgeElement) continue;

        const badgeWidth = badgeElement.offsetWidth + (i > 0 ? gap : 0);

        // If this is the last badge, just check if it fits
        if (i === badgeRefs.current.length - 1) {
          if (totalWidth + badgeWidth <= availableWidth) {
            count++;
          }
        } else {
          // For other badges, check if badge + overflow badge would fit
          if (totalWidth + badgeWidth + overflowBadgeWidth + gap <= availableWidth) {
            count++;
            totalWidth += badgeWidth;
          } else {
            break;
          }
        }
      }

      setVisibleCount(Math.max(0, count));
    };

    calculateVisibleBadges();

    const resizeObserver = new ResizeObserver(calculateVisibleBadges);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [sortedAssignments.length]);

  if (sortedAssignments.length === 0) {
    return (
      <span className="text-xs text-gray-500 italic">
        {emptyMessage}
      </span>
    );
  }

  const visibleAssignments = sortedAssignments.slice(0, visibleCount);
  const overflowAssignments = sortedAssignments.slice(visibleCount);
  const overflowCount = overflowAssignments.length;

  const hiddenTeachers = overflowAssignments
    .map(a => a.teacher?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div ref={containerRef} className={`flex items-center gap-2 flex-1 min-w-0 ${className}`}>
      <div className="flex items-center gap-2 flex-1 flex-nowrap overflow-hidden">
        {sortedAssignments.map((assignment, index) => (
          <span
            key={assignment.id}
            ref={(el) => { badgeRefs.current[index] = el; }}
            style={{
              visibility: visibleAssignments.includes(assignment) ? 'visible' : 'hidden',
              position: visibleAssignments.includes(assignment) ? 'relative' : 'absolute'
            }}
          >
            <TeacherBadge
              name={assignment.teacher!.name}
              role={assignment.role}
            />
          </span>
        ))}
        {overflowCount > 0 && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${theme.backgrounds.neutralLight} ${theme.text.neutral}`}
            title={hiddenTeachers}
          >
            +{overflowCount}
          </span>
        )}
      </div>
    </div>
  );
}
