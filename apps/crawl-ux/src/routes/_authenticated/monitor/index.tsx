import {createFileRoute, Link} from '@tanstack/react-router'
import {useScans, useDatasheets, useCreateScan} from '@/lib/queries.ts'
import {useState} from "react";

export const Route = createFileRoute('/_authenticated/monitor/')({
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

    const createScanMutation = useCreateScan()

    const loading = scansLoading || datasheetsLoading
    const error = scansError || datasheetsError
    const [showForm, setShowForm] = useState(false)
    const [selectedDatasheetId, setSelectedDatasheetId] = useState('')

    // Handle form submission
    const handleSubmitScan = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedDatasheetId) {
            return
        }

        createScanMutation.mutate({
            datasheetId: parseInt(selectedDatasheetId)
        }, {
            onSuccess: () => {
                setShowForm(false)
                setSelectedDatasheetId('')
            }
        })
    }

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
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => setShowForm(true)}>
                    New Scan
                </button>
            </div>

            {showForm ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Create New Scan</h2>
                    </div>
                    
                    <form onSubmit={handleSubmitScan} className="space-y-4">
                        <div>
                            <label htmlFor="datasheetId" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Datasheet
                            </label>
                            <select
                                id="datasheetId"
                                value={selectedDatasheetId}
                                onChange={(e) => setSelectedDatasheetId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Choose a datasheet...</option>
                                {datasheets.map((datasheet) => (
                                    <option key={datasheet.id} value={datasheet.id}>
                                        {getDatasheetName(datasheet.id)}
                                    </option>
                                ))}
                            </select>
                            {datasheets.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    No datasheets available. Create a datasheet first.
                                </p>
                            )}
                        </div>

                        {createScanMutation.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="text-red-800">
                                    <strong>Error:</strong> {createScanMutation.error?.message || 'Failed to create scan'}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={createScanMutation.isPending || !selectedDatasheetId}
                                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                    createScanMutation.isPending || !selectedDatasheetId
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                            >
                                {createScanMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Scan'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setSelectedDatasheetId('')
                                }}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
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
                                            <span
                                                className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(scan.status)}`}>
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
                                                <span
                                                    className="font-medium">Created:</span> {formatDate(scan.createdAt)}
                                            </p>
                                            <p>
                                                <span
                                                    className="font-medium">Updated:</span> {formatDate(scan.updatedAt)}
                                            </p>
                                            <p>
                                                <span
                                                    className="font-medium">Datasheet:</span> {getDatasheetName(scan.datasheetId)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                                        <Link 
                                            to="/monitor/scan/$scanId"
                                            params={{ scanId: scan.id.toString() }}
                                            className="text-blue-500 hover:text-blue-700 font-medium"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}