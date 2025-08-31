import { createFileRoute, Link } from '@tanstack/react-router'
import { useScanResults, useScans, useDatasheets } from '@/lib/queries'
import { ArrowLeft, AlertCircle, CheckCircle, Clock, ExternalLink, Calendar, Database, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { ScanResult } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/monitor/scan/$scanId')({
  component: ScanDetailsPage,
})

function ScanDetailsPage() {
  const { scanId } = Route.useParams()
  const scanIdNumber = parseInt(scanId)
  
  const { data: scans = [] } = useScans()
  const { data: datasheets = [] } = useDatasheets()
  const {
    data: scanResults = [],
    isLoading,
    error
  } = useScanResults(scanIdNumber)

  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())

  // Find the current scan
  const scan = scans.find(s => s.id === scanIdNumber)
  
  // Get datasheet name for the scan
  const getDatasheetName = (datasheetId: number) => {
    const datasheet = datasheets.find(d => d.id === datasheetId)
    return datasheet ? `${datasheet.firstName} ${datasheet.lastName}` : `Datasheet #${datasheetId}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'running':
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleResultExpanded = (resultId: number) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId)
    } else {
      newExpanded.add(resultId)
    }
    setExpandedResults(newExpanded)
  }

  if (!scan) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Link to="/monitor" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Monitor</span>
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Error:</strong> Scan not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/monitor" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Monitor</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Scan Details</h1>
          <p className="text-gray-600">{getDatasheetName(scan.datasheetId)}</p>
        </div>
      </div>

      {/* Scan Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500 font-medium">Scan ID</div>
              <div className="text-xl font-bold">#{scan.id}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusIcon(scan.status)}
            <div>
              <div className="text-sm text-gray-500 font-medium">Status</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scan.status)}`}>
                {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500 font-medium">Created</div>
              <div className="text-lg font-semibold">{formatDate(scan.createdAt)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">{scanResults.length}</span>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Results</div>
              <div className="text-lg font-semibold">{scanResults.length} sources</div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scan Results</h2>
          <p className="text-gray-600 mt-1">Results from all configured PII sources</p>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading results...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">
                <strong>Error:</strong> Failed to load scan results
              </div>
            </div>
          )}

          {!isLoading && !error && scanResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No results yet</div>
              <div className="text-gray-400">Results will appear here as the scan progresses.</div>
            </div>
          )}

          {!isLoading && !error && scanResults.length > 0 && (
            <div className="space-y-4">
              {scanResults.map((result: ScanResult) => {
                const isExpanded = expandedResults.has(result.id)
                return (
                  <div key={result.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Result Header */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-semibold text-gray-900">
                              PII Source #{result.piiSourceId}
                            </div>
                            {result.url && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <ExternalLink className="h-3 w-3" />
                                <a 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600"
                                >
                                  {result.url}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                          
                          <button
                            onClick={() => toggleResultExpanded(result.id)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <EyeOff className="h-4 w-4 text-gray-600" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {result.error && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-red-800">Error</div>
                                <div className="text-red-700 mt-1">{result.error}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {result.data && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Extracted Data:</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {result.metadata && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Metadata:</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(result.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                          <span>Created: {formatDate(result.createdAt)}</span>
                          <span>Updated: {formatDate(result.updatedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}