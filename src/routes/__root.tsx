import { createRootRoute, Outlet } from '@tanstack/react-router'

/**
 * Root route component
 *
 * Note: We no longer need RouterContext since we use:
 * - TanStack Query hooks for data fetching
 * - Zustand stores for global state
 * - Custom hooks for business logic
 */
export const Route = createRootRoute({
  component: () => <Outlet />,
})
