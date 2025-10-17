import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { HomePage } from '../pages/HomePage'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const navigate = useNavigate()
  const context = Route.useRouteContext()
  const { handleRefresh, isRefreshing, isDataReady, isLoading, dataError, retryLoadData, pendingNavigation, requestNavigation, cancelNavigation } = context

  // When data becomes ready and we have a pending navigation, navigate
  useEffect(() => {
    if (pendingNavigation && isDataReady && !isLoading && !dataError) {
      // Clear pending navigation BEFORE navigating to prevent loop
      cancelNavigation();
      navigate({ to: '/date-selection' })
    }
  }, [pendingNavigation, isDataReady, isLoading, dataError, navigate, cancelNavigation]);

  const handleStart = () => {
    if (isDataReady) {
      navigate({ to: '/date-selection' })
    } else {
      requestNavigation();
    }
  }

  return (
    <HomePage
      onStart={handleStart}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      isDataReady={isDataReady}
      isLoading={isLoading}
      dataError={dataError}
      onRetryLoad={retryLoadData}
      waitingForData={pendingNavigation}
      onCancelWaiting={cancelNavigation}
    />
  )
}
