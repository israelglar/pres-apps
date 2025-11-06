import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/LoginPage'

/**
 * Login route - public access only
 * Redirects to home if user is already authenticated
 */
export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    console.log('[/login] beforeLoad check:', {
      hasSession: !!context.auth.session,
      hasTeacher: !!context.auth.teacher,
      teacherName: context.auth.teacher?.name,
    });

    // If already authenticated with valid teacher, redirect to home
    if (context.auth.session && context.auth.teacher) {
      console.log('[/login] Already authenticated, redirecting to home');
      throw redirect({ to: '/' })
    }

    console.log('[/login] Not authenticated, showing login page');
  },
  component: LoginPage,
})
