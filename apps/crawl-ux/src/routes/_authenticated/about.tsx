import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Our Story</h2>
        <p className="mb-4">
          This is the about page of our application. You can add information about your company, team, or project here.
        </p>
        <p className="mb-4">
          This page demonstrates that the sidebar navigation works correctly, allowing users to navigate between different sections of your application.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
        <p className="mb-4">
          Our mission is to provide high-quality software solutions that meet the needs of our users.
        </p>
        <p>
          We are committed to continuous improvement and innovation in everything we do.
        </p>
      </div>
    </div>
  )
}