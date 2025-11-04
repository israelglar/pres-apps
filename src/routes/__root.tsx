import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { Session, User } from '@supabase/supabase-js'
import type { Teacher } from '@/types/database.types'

/**
 * Root route component with authentication context
 *
 * The router context now includes auth information that can be used
 * in beforeLoad hooks to protect routes and check authentication status.
 */
interface RouterContext {
  auth: {
    session: Session | null
    user: User | null
    teacher: Teacher | null
    loading: boolean
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
