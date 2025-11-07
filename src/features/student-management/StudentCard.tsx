import { Edit2, Trash2, User } from 'lucide-react';
import type { Student } from '../../types/database.types';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

/**
 * Student Card Component - Displays individual student information
 *
 * Shows:
 * - Student name
 * - Status badge (active, inactive, aged-out, moved)
 * - Visitor badge (if applicable)
 * - Edit and Delete action buttons
 */
export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
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
    <div className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-all">
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
              {getStatusBadge(student.status)}
              {student.is_visitor && (
                <span className="px-1.5 py-0.5 text-xs font-bold rounded-full border bg-purple-100 text-purple-700 border-purple-300">
                  Visitante
                </span>
              )}
            </div>

            {/* Notes */}
            {student.notes && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-semibold">Notas:</span> {student.notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(student)}
            className="p-1.5 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-colors"
            title="Editar pré"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(student)}
            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Eliminar pré"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
