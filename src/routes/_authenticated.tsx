import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

/**
 * Protected route layout
 * All routes under _authenticated require valid authentication
 * Redirects to /login if not authenticated
 */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    // Wait for auth to finish loading
    if (context.auth.loading) {
      return
    }

    // If not authenticated or not a valid teacher, redirect to login
    if (!context.auth.session || !context.auth.teacher) {
      throw redirect({
        to: '/login',
        search: {
          // Preserve the intended destination for redirect after login
          redirect: location.href,
        },
      })
    }
  },
  component: () => <Outlet />,
})
