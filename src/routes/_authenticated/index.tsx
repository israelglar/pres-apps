import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { HomePage } from '../../features/home'

export const Route = createFileRoute('/_authenticated/')({
  component: HomeRoute,
})

/**
 * Home route component
 *
 * Simplified - just handles navigation
 * All logic is in the HomePage component
 *
 * Clears history when visiting home page to prevent back button issues
 */
function HomeRoute() {
  const navigate = useNavigate()

  // Clear history when home page loads
  useEffect(() => {
    window.history.replaceState(null, '', '/')
  }, [])

  const handleNavigate = () => {
    navigate({ to: '/date-selection' })
  }

  const handleManageStudents = () => {
    navigate({ to: '/manage-students' })
  }

  const handleViewHistory = () => {
    navigate({ to: '/attendance-history' })
  }

  return (
    <HomePage
      onNavigate={handleNavigate}
      onManageStudents={handleManageStudents}
      onViewHistory={handleViewHistory}
    />
  )
}
