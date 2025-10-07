/**
 * React Hooks for Rooms API
 * =========================
 * 
 * Custom hooks for easier integration with React components.
 * Provides loading states, error handling, and automatic re-fetching.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import RoomsService from '../lib/rooms-service'
import type { Room, RoomsResponse, RoomFilters, Review, Favorite, Amenity } from '../types/room'

// Hook return types
interface UseRoomsResult {
  rooms: Room[]
  loading: boolean
  error: string | null
  totalCount: number
  hasNext: boolean
  hasPrevious: boolean
  refetch: () => Promise<void>
}

interface UseRoomResult {
  room: Room | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseReviewsResult {
  reviews: Review[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseFavoritesResult {
  favorites: Favorite[]
  loading: boolean
  error: string | null
  toggleFavorite: (roomId: number) => Promise<void>
  refetch: () => Promise<void>
}

interface UseAmenitiesResult {
  amenities: Amenity[]
  loading: boolean
  error: string | null
}

// ================= ROOMS HOOKS =================

/**
 * Hook to fetch rooms with filters
 * Usage: const { rooms, loading, error, refetch } = useRooms({ status: 'available' })
 */
export function useRooms(filters?: RoomFilters): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: RoomsResponse = await RoomsService.getRooms(filters)
      
      setRooms(response.results)
      setTotalCount(response.count)
      setHasNext(!!response.next)
      setHasPrevious(!!response.previous)
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rooms')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms,
    loading,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    refetch: fetchRooms
  }
}

/**
 * Hook to fetch featured rooms
 */
export function useFeaturedRooms() {
  const filters: RoomFilters = { is_featured: true, status: 'available' }
  return useRooms(filters)
}

/**
 * Hook to fetch a single room by ID
 */
export function useRoom(id: number): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoom = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      
      const roomData = await RoomsService.getRoomById(id)
      setRoom(roomData)
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch room')
      setRoom(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  return {
    room,
    loading,
    error,
    refetch: fetchRoom
  }
}

/**
 * Hook to search rooms
 */
export function useRoomSearch(query: string, filters?: RoomFilters): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const searchRooms = useCallback(async () => {
    if (!query.trim()) {
      setRooms([])
      setTotalCount(0)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response: RoomsResponse = await RoomsService.searchRooms(query, filters)
      
      setRooms(response.results)
      setTotalCount(response.count)
      setHasNext(!!response.next)
      setHasPrevious(!!response.previous)
      
    } catch (err: any) {
      setError(err.message || 'Search failed')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [query, filters])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRooms()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchRooms])

  return {
    rooms,
    loading,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    refetch: searchRooms
  }
}

// ================= REVIEWS HOOKS =================

/**
 * Hook to fetch reviews for a room
 */
export function useReviews(roomId?: number, rating?: number): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const reviewsData = await RoomsService.getReviews(roomId, rating)
      setReviews(reviewsData)
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [roomId, rating])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews
  }
}

// ================= FAVORITES HOOKS =================

/**
 * Hook to manage user favorites
 */
export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const favoritesData = await RoomsService.getFavorites()
      setFavorites(favoritesData)
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites')
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = useCallback(async (roomId: number) => {
    try {
      await RoomsService.toggleFavorite(roomId)
      // Refetch favorites to get updated list
      await fetchFavorites()
    } catch (err: any) {
      setError(err.message || 'Failed to toggle favorite')
    }
  }, [fetchFavorites])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    refetch: fetchFavorites
  }
}

// ================= AMENITIES HOOKS =================

/**
 * Hook to fetch amenities
 */
export function useAmenities(): UseAmenitiesResult {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const amenitiesData = await RoomsService.getAmenities()
        setAmenities(amenitiesData)
        
      } catch (err: any) {
        setError(err.message || 'Failed to fetch amenities')
        setAmenities([])
      } finally {
        setLoading(false)
      }
    }

    fetchAmenities()
  }, [])

  return {
    amenities,
    loading,
    error
  }
}

// ================= UTILITY HOOKS =================

/**
 * Hook to build filters easily
 */
export function useRoomFilters() {
  return useCallback((options: {
    status?: 'available' | 'rented' | 'maintenance' | 'pending'
    featured?: boolean
    verified?: boolean
    priceRange?: [number, number]
    areaRange?: [number, number]
    maxPeople?: number
    search?: string
    sortBy?: 'price' | 'area' | 'date'
    sortOrder?: 'asc' | 'desc'
  }) => {
    return RoomsService.buildFilters(options)
  }, [])
}

// ================= EXAMPLE USAGE =================

/**
 * Example usage in component:
 * 
 * const MyComponent = () => {
 *   // Basic room fetching
 *   const { rooms, loading, error } = useRooms({ status: 'available' })
 * 
 *   // Featured rooms
 *   const { rooms: featuredRooms } = useFeaturedRooms()
 * 
 *   // Single room
 *   const { room } = useRoom(123)
 * 
 *   // Search
 *   const [searchQuery, setSearchQuery] = useState('')
 *   const { rooms: searchResults } = useRoomSearch(searchQuery, { status: 'available' })
 * 
 *   // Reviews
 *   const { reviews } = useReviews(123)
 * 
 *   // Favorites
 *   const { favorites, toggleFavorite } = useFavorites()
 * 
 *   // Amenities
 *   const { amenities } = useAmenities()
 * 
 *   // Filter builder
 *   const buildFilters = useRoomFilters()
 *   const filters = buildFilters({ 
 *     status: 'available', 
 *     featured: true, 
 *     priceRange: [1000000, 3000000] 
 *   })
 * 
 *   return <div>...</div>
 * }
 */