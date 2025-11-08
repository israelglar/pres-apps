import { User, Edit2, Trash2, TrendingUp, Users, UserX } from 'lucide-react'
import { theme, buttonClasses } from '../../config/theme'
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
    active: { label: 'Ativo', color: 'bg-green-100 text-green-700 border-green-200' },
    inactive: { label: 'Inativo', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    aged_out: { label: 'Crescido', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    moved: { label: 'Mudou', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  }

  const statusDisplay = statusConfig[student.status]

  return (
    <div className="space-y-3">
      {/* Student Info Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 border border-white/50">
        {/* Header with Name and Action Icons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Name and Badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
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
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              aria-label="Editar"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Age */}
        {age !== null && (
          <div className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Idade:</span> {age} anos
          </div>
        )}

        {/* Notes */}
        {student.notes && (
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Notas:</span> {student.notes}
            </p>
          </div>
        )}

        {/* Statistics */}
        {stats.total > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h2 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
              Estatísticas
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {/* Attendance Rate */}
              <div className="text-center p-2">
                <div className="text-xl font-bold text-cyan-700 mb-0.5">
                  {stats.attendanceRate}%
                </div>
                <div className="text-xs text-gray-600">Taxa</div>
              </div>

              {/* Present Count */}
              <div className="text-center p-2">
                <div className="text-xl font-bold text-green-700 mb-0.5">
                  {stats.present}
                </div>
                <div className="text-xs text-gray-600">Presenças</div>
              </div>

              {/* Absent Count */}
              <div className="text-center p-2">
                <div className="text-xl font-bold text-red-700 mb-0.5">
                  {stats.absent}
                </div>
                <div className="text-xs text-gray-600">Faltas</div>
              </div>
            </div>

            {/* Additional Stats Row (if excused exists) */}
            {stats.excused > 0 && (
              <div className="flex justify-center mt-2 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <span className="text-lg font-bold text-blue-700">{stats.excused}</span>
                  <span className="text-xs text-gray-600 ml-1">Justificadas</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
