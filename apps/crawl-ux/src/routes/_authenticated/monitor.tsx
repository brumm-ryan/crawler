import { createFileRoute } from '@tanstack/react-router'
import { useScans, useDatasheets } from '../../lib/queries'

export const Route = createFileRoute('/_authenticated/monitor')({
  component: MonitorPage,
})

function MonitorPage() {
  const { 
    data: scans = [], 
    isLoading: scansLoading, 
    error: scansError 
  } = useScans()
  
  const { 
    data: datasheets = [], 
    isLoading: datasheetsLoading, 
    error: datasheetsError 
  } = useDatasheets()

  const loading = scansLoading || datasheetsLoading
  const error = scansError || datasheetsError

  // Get datasheet name for a scan
  const getDatasheetName = (datasheetId: number) => {
    const datasheet = datasheets.find(d => d.id === datasheetId)
    return datasheet ? `${datasheet.firstName} ${datasheet.lastName}` : `Datasheet #${datasheetId}`
  }

  // Function to format date
  const formatDate = (dateString: string | number | Date | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6">Scan Monitor</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading scans...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6">Scan Monitor</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error?.message || 'Failed to load data'}
          </div>
        </div>
      </div>
    )
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

      {scans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No scans found</div>
          <div className="text-gray-400">Create your first scan to get started.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.map((scan) => (
            <div key={scan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{getDatasheetName(scan.datasheetId)}</h2>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(scan.status)}`}>
                    {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">ID:</span> #{scan.id}
                  </p>
                  {scan.externalId && (
                    <p>
                      <span className="font-medium">External ID:</span> {scan.externalId}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Created:</span> {formatDate(scan.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Updated:</span> {formatDate(scan.updatedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Datasheet:</span> {getDatasheetName(scan.datasheetId)}
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
      )}
    </div>
  )
}