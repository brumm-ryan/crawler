import { Link } from '@tanstack/react-router'

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 text-gray-800 fixed left-0 top-[3.5rem] p-4 shadow-sm">
      <nav className="flex flex-col space-y-4">
        <Link
          to="/" 
          className="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          activeProps={{ className: 'bg-gray-200 font-bold' }}
        >
          Home
        </Link>
        <Link
            to="/datasheet"
            className="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
            activeProps={{ className: 'bg-gray-200 font-bold' }}
        >
          Datasheet
        </Link>
        <Link
            to="/monitor"
            className="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
            activeProps={{ className: 'bg-gray-200 font-bold' }}
        >
          Monitor
        </Link>
        {/* Add more navigation links as needed */}
        <Link 
          to="/about" 
          className="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          activeProps={{ className: 'bg-gray-200 font-bold' }}
        >
          About
        </Link>
        <Link 
          to="/contact" 
          className="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          activeProps={{ className: 'bg-gray-200 font-bold' }}
        >
          Contact
        </Link>
      </nav>
    </aside>
  )
}
