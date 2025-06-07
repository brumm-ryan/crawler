import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Homepage</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          This is your new homepage with a left sidebar navigation. You can customize this content as needed.
        </p>
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
          <img
            src={logo}
            className="h-32 pointer-events-none animate-[spin_20s_linear_infinite]"
            alt="logo"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Learn React</h2>
          <p className="mb-4">
            React is a JavaScript library for building user interfaces.
          </p>
          <a
            className="text-blue-500 hover:underline"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about React →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Learn TanStack</h2>
          <p className="mb-4">
            TanStack provides powerful libraries for building modern web applications.
          </p>
          <a
            className="text-blue-500 hover:underline"
            href="https://tanstack.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about TanStack →
          </a>
        </div>
      </div>
    </div>
  )
}
