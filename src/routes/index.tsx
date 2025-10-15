import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HomePage } from '../pages/HomePage'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const navigate = useNavigate()
  const { handleRefresh, isRefreshing } = Route.useRouteContext()

  const handleStart = () => {
    navigate({ to: '/date-selection' })
  }

  return (
    <HomePage
      onStart={handleStart}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  )
}
