import { createFileRoute } from '@tanstack/react-router'
import { StudentDetailPage } from '../../features/student-detail'
import { theme } from '@/config/theme'

export const Route = createFileRoute('/_authenticated/students/$studentId')({
  component: StudentDetailRoute,
})

function StudentDetailRoute() {
  const { studentId } = Route.useParams()

  const handleBack = () => {
    window.history.back()
  }

  const handleEditSuccess = () => {
    // Optional: show toast or notification
  }

  const handleDeleteSuccess = () => {
    // Navigate back after successful deletion
    window.history.back()
  }

  // Parse studentId to number
  const studentIdNum = parseInt(studentId, 10)

  if (isNaN(studentIdNum)) {
    return (
      <div className={`fixed inset-0 ${theme.solids.background} flex items-center justify-center`}>
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md text-center`}>
          <h2 className={`text-xl font-bold ${theme.text.neutralDarkest} mb-2`}>ID Inválido</h2>
          <p className={`text-sm ${theme.text.neutral} mb-5`}>
            O ID do pré fornecido não é válido.
          </p>
          <button
            onClick={handleBack}
            className={`px-5 py-3 ${theme.backgrounds.primary} ${theme.text.white} rounded-lg font-semibold ${theme.backgrounds.primaryActive} active:scale-95 transition-all`}
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <StudentDetailPage
      studentId={studentIdNum}
      onBack={handleBack}
      onEditSuccess={handleEditSuccess}
      onDeleteSuccess={handleDeleteSuccess}
    />
  )
}
