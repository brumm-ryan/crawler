import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/monitor')({
  component: MonitorPage,
})

function MonitorPage() {
  // Sample data for past and current scans
  const [scans] = useState([
    {
      id: 1,
      name: 'Website Scan 1',
      status: 'completed',
      startTime: '2023-10-15T10:30:00',
      endTime: '2023-10-15T11:45:00',
      pagesScanned: 120,
      issuesFound: 23,
    },
    {
      id: 2,
      name: 'E-commerce Platform Scan',
      status: 'in-progress',
      startTime: '2023-10-20T14:15:00',
      endTime: null,
      pagesScanned: 78,
      issuesFound: 12,
    },
    {
      id: 3,
      name: 'Blog Accessibility Check',
      status: 'completed',
      startTime: '2023-10-10T09:00:00',
      endTime: '2023-10-10T10:30:00',
      pagesScanned: 45,
      issuesFound: 8,
    },
    {
      id: 4,
      name: 'Mobile App Interface Scan',
      status: 'scheduled',
      startTime: '2023-10-25T11:00:00',
      endTime: null,
      pagesScanned: 0,
      issuesFound: 0,
    },
  ])

  // Function to format date
  const formatDate = (dateString: string | number | Date | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Scan Monitor</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          View all your past and current scans. Monitor progress and results.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          New Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scans.map((scan) => (
          <div key={scan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{scan.name}</h2>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(scan.status)}`}>
                  {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Started:</span> {formatDate(scan.startTime)}
                </p>
                <p>
                  <span className="font-medium">Completed:</span> {formatDate(scan.endTime)}
                </p>
                <p>
                  <span className="font-medium">Pages Scanned:</span> {scan.pagesScanned}
                </p>
                <p>
                  <span className="font-medium">Issues Found:</span> {scan.issuesFound}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <button className="text-blue-500 hover:text-blue-700 font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}