import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AttendanceMarkingPage } from '../../features/attendance-marking'
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

export const Route = createFileRoute('/_authenticated/marking')({
  validateSearch: (search: Record<string, unknown>): MarkingSearch => {
    return {
      date: (search.date as string) || new Date().toISOString(),
      serviceTimeId: (search.serviceTimeId as number) || 2, // Default to 11h service
    }
  },
  component: MarkingRoute,
})

function MarkingRoute() {
  const navigate = useNavigate()
  const { date, serviceTimeId } = Route.useSearch()
  const { students, visitorStudents, lessonNames, serviceTimes } = useAttendanceData()
  const { handleComplete } = useAttendanceSubmit()

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

  // Convert students to have string IDs and parse date string to Date
  const studentsWithStringIds = students.map(s => ({
    id: String(s.id),
    name: s.name,
    isVisitor: s.is_visitor
  }))
  const selectedDate = new Date(date)

  return (
    <AttendanceMarkingPage
      students={studentsWithStringIds}
      visitorStudents={visitorStudents.map(s => ({
        id: String(s.id),
        name: s.name,
        isVisitor: true
      }))}
      selectedDate={selectedDate}
      serviceTimeId={serviceTimeId}
      serviceTimes={serviceTimes}
      lessonNames={lessonNames}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  )
}
