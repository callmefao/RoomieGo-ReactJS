/**
 * useRooms Hook - Custom hook for room data management
 * ===================================================
 * 
 * Manages room state, fetching, filtering, and caching
 * Updated to work with Django Tro4S API
 */

import { useState, useEffect, useCallback } from 'react'
import RoomsService from '@/lib/rooms-service'
import type { Room, RoomFilters, RoomImage } from '@/types/room'

interface UseRoomsOptions {
  initialFilters?: RoomFilters
  autoFetch?: boolean
}

interface UseRoomsReturn {
  rooms: Room[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  fetchRooms: (filters?: RoomFilters) => Promise<void>
  fetchRoomById: (id: number) => Promise<Room | null>
  clearError: () => void
}

export function useRooms(options: UseRoomsOptions = {}): UseRoomsReturn {
  const { initialFilters, autoFetch = true } = options
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchRooms = useCallback(async (filters?: RoomFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const fetchedRooms = await RoomsService.getRooms(filters)
      setRooms(fetchedRooms)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rooms'
      setError(errorMessage)
      console.error('useRooms Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoomById = useCallback(async (id: number): Promise<Room | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const room = await RoomsService.getRoomById(id)
      return room
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch room'
      setError(errorMessage)
      console.error('useRooms fetchRoomById Error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchRooms(initialFilters)
  }, [fetchRooms, initialFilters])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchRooms(initialFilters)
    }
  }, [autoFetch, initialFilters, fetchRooms])

  return {
    rooms,
    loading,
    error,
    refresh,
    fetchRooms,
    fetchRoomById,
    clearError,
  }
}

/**
 * useRoom Hook - For single room management
 */
export function useRoom(roomId?: number) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoom = useCallback(async (id: number) => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fetchedRoom = await RoomsService.getRoomById(id)
      setRoom(fetchedRoom)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch room'
      setError(errorMessage)
      console.error('useRoom Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId)
    }
  }, [roomId, fetchRoom])

  return {
    room,
    loading,
    error,
    fetchRoom,
    clearError: () => setError(null),
  }
}

/**
 * useRoomImages Hook - For room images management
 */
export function useRoomImages(roomId?: number) {
  const [images, setImages] = useState<RoomImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = useCallback(async (id: number) => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const fetchedImages = await RoomsService.getRoomImages(id)
      setImages(fetchedImages)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch room images'
      setError(errorMessage)
      console.error('useRoomImages Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadImages = useCallback(async (
    id: number, 
    imageType: Parameters<typeof RoomsService.uploadRoomImages>[1], 
    files: File[]
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await RoomsService.uploadRoomImages(id, imageType, files)
      // Refresh images after upload
      await fetchImages(id)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images'
      setError(errorMessage)
      console.error('useRoomImages Upload Error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchImages])

  useEffect(() => {
    if (roomId) {
      fetchImages(roomId)
    }
  }, [roomId, fetchImages])

  return {
    images,
    loading,
    error,
    fetchImages,
    uploadImages,
    clearError: () => setError(null),
  }
}

export default useRooms