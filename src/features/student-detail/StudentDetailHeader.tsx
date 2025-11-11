import { Edit2, Trash2, TrendingUp } from 'lucide-react'
import { theme } from '../../config/theme'
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
    aged_out: { label: 'Crescido', color: `${theme.studentStatus['aged-out'].bg} ${theme.studentStatus['aged-out'].text} ${theme.studentStatus['aged-out'].border}` },
    moved: { label: 'Mudou', color: `${theme.studentStatus.moved.bg} ${theme.studentStatus.moved.text} ${theme.studentStatus.moved.border}` },
  }

  const statusDisplay = statusConfig[student.status]

  return (
    <div className="space-y-3">
      {/* Student Info Card */}
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-4 border border-white/50`}>
        {/* Header with Name and Action Icons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Name and Badges */}
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl font-bold ${theme.text.neutralDarkest} mb-2 break-words`}>
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
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className={`p-2 rounded-lg ${theme.backgrounds.error} ${theme.backgrounds.errorLight} ${theme.text.error} transition-colors`}
              aria-label="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
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
          <div className={`${theme.backgrounds.neutralLight} rounded-lg p-2.5 border ${theme.borders.neutralLight}`}>
            <p className={`text-sm ${theme.text.neutralDark}`}>
              <span className="font-semibold">Notas:</span> {student.notes}
            </p>
          </div>
        )}

        {/* Statistics */}
        {stats.total > 0 && (
          <div className={`mt-3 pt-3 border-t ${theme.borders.neutralLight}`}>
            <h2 className={`text-xs font-bold ${theme.text.neutralDarker} mb-2 flex items-center gap-1.5`}>
              <TrendingUp className={`w-3.5 h-3.5 ${theme.text.primary}`} />
              Estatísticas
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {/* Attendance Rate */}
              <div className="text-center p-2">
                <div className={`text-xl font-bold ${theme.text.primaryDark} mb-0.5`}>
                  {stats.attendanceRate}%
                </div>
                <div className={`text-xs ${theme.text.neutral}`}>Taxa</div>
              </div>

              {/* Present Count */}
              <div className="text-center p-2">
                <div className={`text-xl font-bold ${theme.text.success} mb-0.5`}>
                  {stats.present}
                </div>
                <div className={`text-xs ${theme.text.neutral}`}>Presenças</div>
              </div>

              {/* Absent Count */}
              <div className="text-center p-2">
                <div className={`text-xl font-bold ${theme.text.error} mb-0.5`}>
                  {stats.absent}
                </div>
                <div className={`text-xs ${theme.text.neutral}`}>Faltas</div>
              </div>
            </div>

            {/* Additional Stats Row (if excused exists) */}
            {stats.excused > 0 && (
              <div className={`flex justify-center mt-2 pt-2 border-t ${theme.borders.neutralLight}`}>
                <div className="text-center">
                  <span className={`text-lg font-bold ${theme.text.secondary}`}>{stats.excused}</span>
                  <span className={`text-xs ${theme.text.neutral} ml-1`}>Justificadas</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
