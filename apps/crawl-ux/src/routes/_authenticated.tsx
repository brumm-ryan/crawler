import {createFileRoute, Outlet, useNavigate} from '@tanstack/react-router'
import {useAuth} from "@workos-inc/authkit-react";
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {

  const { user } = useAuth();
  const navigate = useNavigate()

  if (!user) {
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