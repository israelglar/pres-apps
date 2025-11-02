import { Edit2, Trash2, User } from 'lucide-react';
import { theme } from '../../config/theme';
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
        className={`px-2 py-1 text-xs font-bold rounded-full border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDateOfBirth = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;

    try {
      const date = new Date(dateOfBirth);
      return date.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  return (
    <div
      className={`${theme.gradients.cardNeutral} border-2 ${theme.borders.primary} rounded-xl p-4 hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Student Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`${theme.backgrounds.primaryLight} p-3 rounded-xl flex-shrink-0`}>
            <User className={`w-6 h-6 ${theme.text.primary}`} />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold ${theme.text.neutralDarker} mb-2 break-words`}>
              {student.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getStatusBadge(student.status)}
              {student.is_visitor && (
                <span className="px-2 py-1 text-xs font-bold rounded-full border bg-purple-100 text-purple-700 border-purple-300">
                  Visitante
                </span>
              )}
            </div>

            {/* Additional Info */}
            {(student.date_of_birth || student.notes) && (
              <div className="space-y-1 mt-2">
                {student.date_of_birth && (
                  <p className={`text-sm ${theme.text.neutral}`}>
                    <span className="font-semibold">Data de Nascimento:</span>{' '}
                    {formatDateOfBirth(student.date_of_birth)}
                  </p>
                )}
                {student.notes && (
                  <p className={`text-sm ${theme.text.neutral}`}>
                    <span className="font-semibold">Notas:</span> {student.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(student)}
            className={`p-2 ${theme.backgrounds.primaryLight} ${theme.text.primary} rounded-lg hover:bg-cyan-200 transition-colors`}
            title="Editar aluno"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(student)}
            className={`p-2 ${theme.backgrounds.error} ${theme.text.error} rounded-lg hover:bg-red-200 transition-colors`}
            title="Eliminar aluno"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
