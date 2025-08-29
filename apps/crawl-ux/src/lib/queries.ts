import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scanApi, datasheetApi } from './api'
import type { DatasheetCreate } from './types'

// Query keys
export const queryKeys = {
  scans: ['scans'] as const,
  datasheets: ['datasheets'] as const,
  datasheet: (id: number) => ['datasheets', id] as const,
}

// Scan hooks
export function useScans() {
  return useQuery({
    queryKey: queryKeys.scans,
    queryFn: scanApi.getAll,
  })
}

export function useCreateScan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: scanApi.create,
    onSuccess: () => {
      // Invalidate and refetch scans
      queryClient.invalidateQueries({ queryKey: queryKeys.scans })
    },
  })
}

// Datasheet hooks
export function useDatasheets() {
  return useQuery({
    queryKey: queryKeys.datasheets,
    queryFn: datasheetApi.getAll,
  })
}

export function useDatasheet(id: number) {
  return useQuery({
    queryKey: queryKeys.datasheet(id),
    queryFn: () => datasheetApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateDatasheet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: datasheetApi.create,
    onSuccess: () => {
      // Invalidate and refetch datasheets
      queryClient.invalidateQueries({ queryKey: queryKeys.datasheets })
    },
  })
}

export function useUpdateDatasheet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DatasheetCreate> }) => 
      datasheetApi.update(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch datasheets and the specific datasheet
      queryClient.invalidateQueries({ queryKey: queryKeys.datasheets })
      queryClient.invalidateQueries({ queryKey: queryKeys.datasheet(data.id) })
    },
  })
}

export function useDeleteDatasheet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: datasheetApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove the deleted datasheet from cache and invalidate datasheets list
      queryClient.removeQueries({ queryKey: queryKeys.datasheet(deletedId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.datasheets })
    },
  })
}

// Note: Auth hooks removed - using manual state management in AuthProvider