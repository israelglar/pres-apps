import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AttendanceMarkingPage } from '../pages/AttendanceMarkingPage'

type MarkingSearch = {
  date: string
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F";
  timestamp: Date;
}

export const Route = createFileRoute('/marking')({
  validateSearch: (search: Record<string, unknown>): MarkingSearch => {
    return {
      date: (search.date as string) || new Date().toISOString(),
    }
  },
  component: MarkingRoute,
})

function MarkingRoute() {
  const navigate = useNavigate()
  const { date } = Route.useSearch()
  const { students, handleComplete } = Route.useRouteContext()

  const onComplete = async (records: AttendanceRecord[]) => {
    await handleComplete(records, date)
    navigate({ to: '/' })
  }

  // Convert students to have string IDs and parse date string to Date
  const studentsWithStringIds = students.map(s => ({ ...s, id: String(s.id) }))
  const selectedDate = new Date(date)

  return (
    <AttendanceMarkingPage
      students={studentsWithStringIds}
      selectedDate={selectedDate}
      onComplete={onComplete}
    />
  )
}
