import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StudentManagementPage } from '../../features/student-management'

export const Route = createFileRoute('/_authenticated/manage-students')({
  component: ManageStudentsRoute,
})

function ManageStudentsRoute() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate({ to: '/' })
  }

  const handleStudentClick = (student: { id: number }) => {
    navigate({ to: '/students/$studentId', params: { studentId: student.id.toString() } })
  }

  return (
    <StudentManagementPage
      onBack={handleBack}
      onStudentClick={handleStudentClick}
    />
  )
}
