import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

/**
 * Protected route layout
 * All routes under _authenticated require valid authentication
 * Redirects to /login if not authenticated
 */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    console.log('[_authenticated] beforeLoad check:', {
      loading: context.auth.loading,
      hasSession: !!context.auth.session,
      hasTeacher: !!context.auth.teacher,
      teacherName: context.auth.teacher?.name,
      path: location.pathname,
    });

    // Wait for auth to finish loading
    if (context.auth.loading) {
      console.log('[_authenticated] Auth still loading, allowing through...');
      return
    }

    // If not authenticated or not a valid teacher, redirect to login
    if (!context.auth.session || !context.auth.teacher) {
      console.log('[_authenticated] Not authenticated or no teacher, redirecting to /login');
      throw redirect({
        to: '/login',
        search: {
          // Preserve the intended destination for redirect after login
          redirect: location.href,
        },
      })
    }

    console.log('[_authenticated] Authentication check passed');
  },
  component: () => <Outlet />,
})
