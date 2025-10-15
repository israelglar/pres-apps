import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export interface RouterContext {
  allSundays: Date[]
  students: { id: number; name: string }[]
  handleComplete: (records: any[], selectedDate: string) => Promise<void>
  handleRefresh: () => Promise<void>
  isRefreshing: boolean
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
