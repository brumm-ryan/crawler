import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from '../lib/auth'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </AuthProvider>
  ),
})
