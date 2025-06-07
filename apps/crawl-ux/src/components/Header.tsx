import { Link } from '@tanstack/react-router'

export default function Header() {
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
    </header>
  )
}
