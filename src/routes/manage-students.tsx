import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StudentManagementPage } from '../features/student-management'

export const Route = createFileRoute('/manage-students')({
  component: ManageStudentsRoute,
})

function ManageStudentsRoute() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate({ to: '/' })
  }

  return <StudentManagementPage onBack={handleBack} />
}
