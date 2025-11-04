import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/**
 * Router instance
 *
 * Note: The router context is provided when the router is created in App.tsx
 * via <RouterProvider router={router} context={{ auth }} />
 */
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  basepath: import.meta.env.BASE_URL,
  context: undefined!,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
