import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  allSundays: Date[]
  lessonNames: Record<string, string>
  students: { id: number; name: string }[]
  handleComplete: (records: any[], selectedDate: string) => Promise<void>
  handleRefresh: () => Promise<void>
  isRefreshing: boolean
  isDataReady: boolean
  isLoading: boolean
  dataError: string | null
  retryLoadData: () => void
  pendingNavigation: boolean
  requestNavigation: () => void
  cancelNavigation: () => void
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
