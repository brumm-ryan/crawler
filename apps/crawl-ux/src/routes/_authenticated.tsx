import {createFileRoute, Outlet, useNavigate} from '@tanstack/react-router'
import {useAuth} from '../lib/auth';
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {

  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    navigate({to: '/login'})
    return null
  }

  return (
    <>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 mt-[3.5rem]">
          <Outlet />
        </main>
      </div>
    </>
  )
}