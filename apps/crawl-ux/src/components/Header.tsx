import { Link } from '@tanstack/react-router'
import { useAuth } from '../lib/auth'

export default function Header() {
  const { user, login, logout } = useAuth()

  return (
    <header className="px-4 py-3 flex items-center bg-white text-black justify-between shadow-md fixed top-0 left-0 right-0 z-10">
      <nav className="flex flex-row items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          activeProps={{ className: 'text-blue-600' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
        </Link>
      </nav>
      
      <div className="text-lg font-semibold">Crawl UX</div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
              <span className="text-sm font-medium">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}
