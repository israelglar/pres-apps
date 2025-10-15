import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  allSundays: Date[]
  lessonNames: Record<string, string>
  students: { id: number; name: string }[]
  handleComplete: (records: any[], selectedDate: string) => Promise<void>
  handleRefresh: () => Promise<void>
  isRefreshing: boolean
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
