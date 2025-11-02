import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HomePage } from '../features/home'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

/**
 * Home route component
 *
 * Simplified - just handles navigation
 * All logic is in the HomePage component
 */
function HomeRoute() {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate({ to: '/date-selection' })
  }

  const handleManageStudents = () => {
    navigate({ to: '/manage-students' })
  }

  return <HomePage onNavigate={handleNavigate} onManageStudents={handleManageStudents} />
}
