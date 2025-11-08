import { User, ChevronRight } from 'lucide-react';
import type { Student } from '../../types/database.types';

interface StudentCardProps {
  student: Student;
  onClick: (student: Student) => void;
}

/**
 * Student Card Component - Displays individual student information
 *
 * Shows:
 * - Student name
 * - Status badge (active, inactive, aged-out, moved)
 * - Visitor badge (if applicable)
 * - Clickable to navigate to student detail page
 */
export function StudentCard({ student, onClick }: StudentCardProps) {
  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      active: {
        label: 'Ativo',
        className: 'bg-green-100 text-green-700 border-green-300',
      },
      inactive: {
        label: 'Inativo',
        className: 'bg-gray-100 text-gray-700 border-gray-300',
      },
      'aged-out': {
        label: 'Saiu',
        className: 'bg-amber-100 text-amber-700 border-amber-300',
      },
      moved: {
        label: 'Mudou',
        className: 'bg-blue-100 text-blue-700 border-blue-300',
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
      className="w-full bg-white rounded-xl shadow-lg p-3 hover:shadow-xl hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer text-left"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Student Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Avatar */}
          <div className="bg-cyan-100 p-1.5 rounded-lg flex-shrink-0">
            <User className="w-4 h-4 text-cyan-600" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Name, Status, and Visitor Badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">
                {student.name}
              </h3>
              {student.status !== 'active' && getStatusBadge(student.status)}
              {student.is_visitor && (
                <span className="px-1.5 py-0.5 text-xs font-bold rounded-full border bg-purple-100 text-purple-700 border-purple-300">
                  Visitante
                </span>
              )}
            </div>

            {/* Notes */}
            {student.notes && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                <span className="font-semibold">Notas:</span> {student.notes}
              </p>
            )}
          </div>
        </div>

        {/* Right Arrow Icon */}
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </button>
  );
}
