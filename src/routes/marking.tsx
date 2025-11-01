import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AttendanceMarkingPage } from '../features/attendance-marking'
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
  const { students, lessonNames } = useAttendanceData()
  const { handleComplete } = useAttendanceSubmit()

  const onComplete = async (records: AttendanceRecord[]) => {
    // Transform records from component format to API format
    const apiRecords = records.map(r => ({
      studentId: parseInt(r.studentId), // Convert string ID to number
      status: r.status === 'P' ? 'present' : 'absent',
    }))
    await handleComplete(apiRecords, date)
    navigate({ to: '/' })
  }

  const onCancel = () => {
    navigate({ to: '/date-selection' })
  }

  // Convert students to have string IDs and parse date string to Date
  const studentsWithStringIds = students.map(s => ({ ...s, id: String(s.id) }))
  const selectedDate = new Date(date)

  return (
    <AttendanceMarkingPage
      students={studentsWithStringIds}
      selectedDate={selectedDate}
      lessonNames={lessonNames}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  )
}
