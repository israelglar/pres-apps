import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy } from 'react'

const LoginPage = lazy(() => import('@/features/auth/LoginPage').then(m => ({ default: m.LoginPage })))

/**
 * Login route - public access only
 * Redirects to home if user is already authenticated
 */
export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    // If already authenticated with valid teacher, redirect to home
    if (context.auth.session && context.auth.teacher) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
