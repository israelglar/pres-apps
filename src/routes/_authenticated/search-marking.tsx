import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SearchAttendanceMarkingPage } from '../../features/search-marking'
import { useAttendanceData, useAttendanceSubmit } from '../../hooks/useAttendanceData'

type MarkingSearch = {
  date: string
  serviceTimeId: number
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F";
  timestamp: Date;
  notes?: string;
}

export const Route = createFileRoute('/_authenticated/search-marking')({
  validateSearch: (search: Record<string, unknown>): MarkingSearch => {
    return {
      date: (search.date as string) || new Date().toISOString(),
      serviceTimeId: (search.serviceTimeId as number) || 2, // Default to 11h service
    }
  },
  component: SearchMarkingRoute,
})

function SearchMarkingRoute() {
  const navigate = useNavigate()
  const { date, serviceTimeId } = Route.useSearch()
  const { students, visitorStudents, lessonNames } = useAttendanceData()
  const { handleComplete } = useAttendanceSubmit()

  const selectedDate = new Date(date)

  const onComplete = async (records: AttendanceRecord[]) => {
    // Transform records from component format to API format
    const apiRecords = records.map(r => ({
      studentId: parseInt(r.studentId), // Convert string ID to number
      status: r.status === 'P' ? 'present' : 'absent',
      notes: r.notes,
    }))
    await handleComplete(apiRecords, date, serviceTimeId)
    navigate({ to: '/' })
  }

  const onCancel = () => {
    navigate({ to: '/date-selection' })
  }

  return (
    <SearchAttendanceMarkingPage
      students={students.map(s => ({
        id: String(s.id),
        name: s.name,
        isVisitor: s.is_visitor
      }))}
      visitorStudents={visitorStudents.map(s => ({
        id: String(s.id),
        name: s.name,
        isVisitor: true
      }))}
      date={selectedDate}
      lessonNames={lessonNames}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  )
}
