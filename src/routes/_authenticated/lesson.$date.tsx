import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LessonDetailPage } from '../../features/lessons'
import { theme } from '@/config/theme'
import { z } from 'zod'

// Define search params schema
const lessonDetailSearchSchema = z.object({
  serviceTimeId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/lesson/$date')({
  component: LessonDetailRoute,
  validateSearch: (search) => lessonDetailSearchSchema.parse(search),
})

function LessonDetailRoute() {
  const { date } = Route.useParams()
  const { serviceTimeId } = Route.useSearch()
  const navigate = useNavigate()

  const handleBack = () => {
    // Navigate back to lessons page with scroll position
    navigate({
      to: '/lessons',
      search: { scrollToDate: date },
    })
  }

  const handleViewStudent = (studentId: number) => {
    navigate({ to: '/students/$studentId', params: { studentId: studentId.toString() } })
  }

  const handleRedoAttendance = (scheduleDate: string, serviceTimeId: number) => {
    navigate({
      to: '/search-marking',
      search: {
        date: scheduleDate,
        serviceTimeId: serviceTimeId,
      },
    })
  }

  // Validate date format (YYYY-MM-DD)
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date)

  if (!isValidDate) {
    return (
      <div className={`fixed inset-0 ${theme.solids.background} flex items-center justify-center`}>
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md text-center`}>
          <h2 className={`text-xl font-bold ${theme.text.neutralDarkest} mb-2`}>Data Inválida</h2>
          <p className={`text-sm ${theme.text.neutral} mb-5`}>
            A data fornecida não é válida.
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
    <LessonDetailPage
      date={date}
      initialServiceTimeId={serviceTimeId}
      onBack={handleBack}
      onViewStudent={handleViewStudent}
      onRedoAttendance={handleRedoAttendance}
    />
  )
}
