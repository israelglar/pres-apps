import { useState } from 'react'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { theme } from '../../config/theme'
import { PageHeader } from '../../components/ui/PageHeader'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import { useStudentDetail } from '../../hooks/useStudentDetail'
import { useUpdateStudent, useDeleteStudent } from '../../hooks/useStudentManagement'
import { StudentDetailHeader } from './StudentDetailHeader'
import { AttendanceTimelineList } from './AttendanceTimelineList'
import { StudentFormModal, DeleteConfirmDialog } from '../student-management'
import type { StudentInsert, StudentUpdate } from '../../types/database.types'

interface StudentDetailPageProps {
  studentId: number
  onBack: () => void
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
}

/**
 * Student Detail Page
 * Shows comprehensive student info and attendance history
 */
export function StudentDetailPage({
  studentId,
  onBack,
  onEditSuccess,
  onDeleteSuccess,
}: StudentDetailPageProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch student detail data
  const {
    student,
    age,
    sundayRecords,
    stats,
    consecutiveAbsences,
    hasAbsenceAlert,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentDetail({
    studentId,
  })

  // Mutations
  const updateMutation = useUpdateStudent()
  const deleteMutation = useDeleteStudent()

  // Pull-to-refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      refetch()
    },
  })

  // Modal handlers
  const handleOpenEdit = () => setIsEditModalOpen(true)
  const handleCloseEdit = () => setIsEditModalOpen(false)
  const handleEditSubmit = (data: StudentInsert | StudentUpdate) => {
    updateMutation.mutate(
      { id: studentId, updates: data as StudentUpdate },
      {
        onSuccess: () => {
          handleCloseEdit()
          refetch()
          onEditSuccess?.()
        },
      }
    )
  }

  const handleOpenDelete = () => setIsDeleteDialogOpen(true)
  const handleCloseDelete = () => setIsDeleteDialogOpen(false)
  const handleDeleteConfirm = () => {
    deleteMutation.mutate(studentId, {
      onSuccess: () => {
        handleCloseDelete()
        onDeleteSuccess?.()
        onBack()
      },
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`fixed inset-0 ${theme.backgrounds.page} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`w-12 h-12 ${theme.text.primary} animate-spin`} />
          <p className={`${theme.text.neutralDarker} text-sm font-semibold`}>
            A carregar dados do pré...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !student) {
    return (
      <div className={`fixed inset-0 ${theme.backgrounds.page} flex items-center justify-center p-5`}>
        <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            {error?.message || 'Não foi possível carregar os dados do pré'}
          </p>
          <button
            onClick={onBack}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}
      onTouchStart={pullToRefresh.handleTouchStart}
      onTouchMove={pullToRefresh.handleTouchMove}
      onTouchEnd={pullToRefresh.handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullToRefresh.pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 transition-all"
          style={{
            height: `${pullToRefresh.pullDistance}px`,
            opacity: pullToRefresh.pullDistance / 80,
          }}
        >
          <RefreshCw
            className={`w-6 h-6 ${theme.text.primary} ${pullToRefresh.isRefreshing ? 'animate-spin' : ''}`}
          />
        </div>
      )}

      {/* Header */}
      <PageHeader
        onBack={onBack}
        title="Detalhes do pré"
        subtitle=""
        sticky={true}
        variant='minimal'
      />

      <div className="max-w-4xl mx-auto p-3 pb-20 space-y-3">
        {/* Student Info and Stats */}
        <StudentDetailHeader
          student={student}
          age={age}
          stats={stats}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />

        {/* Absence Alert */}
        {hasAbsenceAlert && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Alerta de Faltas
              </h3>
              <p className="text-sm text-red-800">
                Este pré tem <strong>{consecutiveAbsences} faltas consecutivas</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Attendance Timeline */}
        <AttendanceTimelineList
          records={sundayRecords}
          studentId={studentId}
          studentName={student.name}
          isLoading={isLoading}
        />
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && student && (
        <StudentFormModal
          student={student}
          onClose={handleCloseEdit}
          onSubmit={handleEditSubmit}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && student && (
        <DeleteConfirmDialog
          studentName={student.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleCloseDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
