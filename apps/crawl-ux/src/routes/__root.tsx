import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthKitProvider } from '@workos-inc/authkit-react'

export const Route = createRootRoute({
  component: () => (
    <AuthKitProvider
      clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}
      redirectUri="http://localhost:8081"
    >
      <div className="flex flex-col min-h-screen">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </AuthKitProvider>
  ),
})
