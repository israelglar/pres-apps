import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SearchAttendanceMarkingPage } from '../features/search-marking'
import { useAttendanceData, useAttendanceSubmit } from '../hooks/useAttendanceData'

type MarkingSearch = {
  date: string
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F";
  timestamp: Date;
}

export const Route = createFileRoute('/search-marking')({
  validateSearch: (search: Record<string, unknown>): MarkingSearch => {
    return {
      date: (search.date as string) || new Date().toISOString(),
    }
  },
  component: SearchMarkingRoute,
})

function SearchMarkingRoute() {
  const navigate = useNavigate()
  const { date } = Route.useSearch()
  const { students, lessonNames } = useAttendanceData()
  const { handleComplete } = useAttendanceSubmit()

  const selectedDate = new Date(date)

  const onComplete = async (records: AttendanceRecord[]) => {
    await handleComplete(records, date)
    navigate({ to: '/' })
  }

  const onCancel = () => {
    navigate({ to: '/date-selection' })
  }

  return (
    <SearchAttendanceMarkingPage
      students={students.map(s => ({ id: String(s.id), name: s.name }))}
      date={selectedDate}
      lessonNames={lessonNames}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  )
}
