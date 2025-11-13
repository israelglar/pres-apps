import { ChevronRight, AlertTriangle } from 'lucide-react';
import type { Student } from '../../types/database.types';
import type { StudentWithAlert } from '../../hooks/useStudentManagement';
import { theme } from '../../config/theme';

interface StudentCardProps {
  student: StudentWithAlert;
  onClick: (student: StudentWithAlert) => void;
  hasAlert?: boolean;
}

/**
 * Student Card Component - Displays individual student information
 *
 * Shows:
 * - Student name
 * - Alert icon (if student has consecutive absences)
 * - Status badge (active, inactive, aged-out, moved)
 * - Visitor badge (if applicable)
 * - Clickable to navigate to student detail page
 */
export function StudentCard({ student, onClick, hasAlert = false }: StudentCardProps) {
  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      active: {
        label: 'Ativo',
        className: `${theme.studentStatus.active.bg} ${theme.studentStatus.active.text} ${theme.studentStatus.active.border}`,
      },
      inactive: {
        label: 'Inativo',
        className: `${theme.studentStatus.inactive.bg} ${theme.studentStatus.inactive.text} ${theme.studentStatus.inactive.border}`,
      },
      'aged-out': {
        label: 'Passou',
        className: `${theme.studentStatus['aged-out'].bg} ${theme.studentStatus['aged-out'].text} ${theme.studentStatus['aged-out'].border}`,
      },
      moved: {
        label: 'Mudou',
        className: `${theme.studentStatus.moved.bg} ${theme.studentStatus.moved.text} ${theme.studentStatus.moved.border}`,
      },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span
        className={`px-1.5 py-0.5 text-xs font-bold rounded-full border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <button
      onClick={() => onClick(student)}
      className={`w-full ${theme.backgrounds.white} rounded-xl shadow-lg p-3 hover:shadow-xl ${theme.backgrounds.neutralHover} active:scale-[0.99] transition-all cursor-pointer text-left`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Student Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Name, Status, and Visitor Badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`text-sm font-bold ${theme.text.primary}`}>
                {student.name}
              </h3>
              {student.status !== 'active' && getStatusBadge(student.status)}
              {student.is_visitor && (
                <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full border ${theme.studentStatus.visitor.bg} ${theme.studentStatus.visitor.text} ${theme.studentStatus.visitor.border}`}>
                  Visitante
                </span>
              )}
            </div>

            {/* Notes */}
            {student.notes && (
              <p className={`text-xs ${theme.text.neutral} mt-1 line-clamp-1`}>
                <span className="font-semibold">Notas:</span> {student.notes}
              </p>
            )}
          </div>
        </div>

        {/* Alert Icon - Far right, separate from name */}
        {hasAlert && (
          <div className="flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
        )}

        {/* Right Arrow Icon */}
        <div className="flex-shrink-0">
          <ChevronRight className={`w-5 h-5 ${theme.text.neutralLight}`} />
        </div>
      </div>
    </button>
  );
}
