import { Edit2, Trash2 } from 'lucide-react'
import { theme } from '../../config/theme'
import { AttendanceStats as AttendanceStatsComponent } from '../../components/AttendanceStats'
import type { Student } from '../../types/database.types'
import type { AttendanceStats } from './student-detail.logic'

interface StudentDetailHeaderProps {
  student: Student
  age: number | null
  stats: AttendanceStats
  onEdit: () => void
  onDelete: () => void
}

/**
 * Student detail header with info, stats, and actions
 */
export function StudentDetailHeader({
  student,
  age,
  stats,
  onEdit,
  onDelete,
}: StudentDetailHeaderProps) {
  // Status badge configuration
  const statusConfig = {
    active: { label: 'Ativo', color: `${theme.studentStatus.active.bg} ${theme.studentStatus.active.text} ${theme.studentStatus.active.border}` },
    inactive: { label: 'Inativo', color: `${theme.studentStatus.inactive.bg} ${theme.studentStatus.inactive.text} ${theme.studentStatus.inactive.border}` },
    'aged-out': { label: 'Passou', color: `${theme.studentStatus['aged-out'].bg} ${theme.studentStatus['aged-out'].text} ${theme.studentStatus['aged-out'].border}` },
    moved: { label: 'Mudou', color: `${theme.studentStatus.moved.bg} ${theme.studentStatus.moved.text} ${theme.studentStatus.moved.border}` },
  }

  const statusDisplay = statusConfig[student.status]

  return (
    <div className="space-y-3">
      {/* Student Info Card */}
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow`}>
        {/* Header with Name and Action Icons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Name and Badges */}
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl font-semibold ${theme.text.neutralDarkest} mb-2 break-words`}>
              {student.name}
            </h1>

            {/* Status and Visitor Badges */}
            {(student.status !== 'active' || student.is_visitor) && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge (only show if not active) */}
                {student.status !== 'active' && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusDisplay.color}`}
                  >
                    {statusDisplay.label}
                  </span>
                )}

                {/* Visitor Badge */}
                {student.is_visitor && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme.studentStatus.visitor.bg} ${theme.studentStatus.visitor.text} border ${theme.studentStatus.visitor.border}`}>
                    Visitante
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Icon Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className={`p-2 rounded-lg ${theme.backgrounds.neutral} ${theme.backgrounds.neutralHover} ${theme.text.neutralDark} transition-colors`}
              aria-label="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className={`p-2 rounded-lg ${theme.backgrounds.error} ${theme.backgrounds.errorLight} ${theme.text.error} transition-colors`}
              aria-label="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Age */}
        {age !== null && (
          <div className={`mb-2 text-sm ${theme.text.neutralDark}`}>
            <span className="font-semibold">Idade:</span> {age} anos
          </div>
        )}

        {/* Notes */}
        {student.notes && (
          <div className={`${theme.backgrounds.neutralLight} rounded-lg p-3 border ${theme.borders.neutralLight}`}>
            <p className={`text-sm ${theme.text.neutralDark}`}>
              <span className="font-semibold">Notas:</span> {student.notes}
            </p>
          </div>
        )}

        {/* Statistics */}
        {stats.total > 0 && (
          <div className={`mt-4 pt-4 border-t ${theme.borders.neutralLight}`}>
            <AttendanceStatsComponent
              stats={{
                present: stats.present,
                absent: stats.absent,
                visitors: 0,
                total: stats.total,
                totalPresent: stats.present,
              }}
              mode="detailed"
              showAbsent={true}
              showTotalPresent={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
