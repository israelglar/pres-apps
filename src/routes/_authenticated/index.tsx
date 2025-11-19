import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy } from 'react'

const HomePage = lazy(() => import('../../features/home').then(m => ({ default: m.HomePage })))

export const Route = createFileRoute('/_authenticated/')({
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

  const handleViewHistory = () => {
    navigate({ to: '/lessons' })
  }

  const handleQuickStart = (date: string, serviceTimeId: number) => {
    navigate({
      to: '/search-marking',
      search: { date, serviceTimeId }
    })
  }

  return (
    <HomePage
      onNavigate={handleNavigate}
      onManageStudents={handleManageStudents}
      onViewHistory={handleViewHistory}
      onQuickStart={handleQuickStart}
    />
  )
}
