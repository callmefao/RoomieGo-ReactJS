/**
 * Rooms Service - API calls for Room management
 * ============================================
 * 
 * This service handles all room-related API operations:
 * - Fetching rooms with filters
 * - CRUD operations for rooms
 * - Room favorites management
 * - Room reviews handling
 * 
 * Clean separation from ApiClient for better maintainability
 */

import { apiClient } from './api-client'
import type {
  Room,
  RoomImage,
  RoomFilters,
  CreateRoomPayload,
  ImageUploadResponse,
  ImageDeleteResponse,
  Review,
  Favorite,
  PendingRoom,
  PendingRoomsResponse,
} from '../types/room'

export class RoomsService {

  // ================= ADMIN PENDING ROOMS =================

  /**
   * Lấy danh sách phòng đang chờ duyệt (Admin)
   * Matches: GET /api/rooms/admin/pending/
   */
  public static async getPendingRooms(): Promise<{ rooms: PendingRoom[]; total: number }> {
    const response = await apiClient.get<PendingRoomsResponse | PendingRoom[]>(
      '/api/rooms/admin/pending/',
      { includeAuth: true },
    )

    const payload = response.data
    const rooms = Array.isArray(payload) ? payload : payload.results || []
    const total = Array.isArray(payload) ? payload.length : payload.count ?? rooms.length

    return { rooms, total }
  }

  /**
   * Duyệt phòng đang chờ (Admin)
   * Matches: POST /api/rooms/{id}/approve/
   */
  public static async approvePendingRoom(roomId: number): Promise<void> {
    await apiClient.post(`/api/rooms/${roomId}/approve/`, {}, { includeAuth: true })
  }

  /**
   * Từ chối phòng đang chờ (Admin)
   * Matches: POST /api/rooms/admin/pending/{id}/reject/
   */
  public static async rejectPendingRoom(roomId: number): Promise<void> {
    await apiClient.post(`/api/rooms/admin/pending/${roomId}/reject/`, {}, { includeAuth: true })
  }
  
  // ================= ROOMS CRUD =================
  
  /**
   * Get all rooms with optional filtering
   * Matches: GET /api/rooms/?status=1&is_featured=True&min_price=1000000&max_price=3000000
   */
  public static async getRooms(filters?: RoomFilters, options?: { includeAuth?: boolean }): Promise<any> {
    const response = await apiClient.get<any>(
      '/api/rooms/',
      { 
        params: filters,
        includeAuth: options?.includeAuth ?? false // Public endpoint by default
      }
    )
    return response.data
  }

  /**
   * Get single room by ID with full details including images
   * Matches: GET /api/rooms/{id}/
   */
  public static async getRoomById(id: number): Promise<Room> {
    const response = await apiClient.get<Room>(
      `/api/rooms/${id}/`,
      { includeAuth: false }
    )
    return response.data
  }

  /**
   * Get room images for a specific room
   * Matches: GET /api/rooms/{id}/images/
   */
  public static async getRoomImages(roomId: number): Promise<RoomImage[]> {
    const response = await apiClient.get<RoomImage[]>(
      `/api/rooms/${roomId}/images/`,
      { includeAuth: false }
    )
    return response.data
  }

  /**
   * Upload images for a room by type
   * Matches: POST /api/rooms/{id}/upload_images/{image_type}/
   * image_type: main, interior, exterior, bathroom, kitchen, parking, laundry, 360, normal
   */
  public static async uploadRoomImages(
    roomId: number, 
    imageType: 'main' | 'interior' | 'exterior' | 'bathroom' | 'kitchen' | 'parking' | 'laundry' | '360' | 'normal',
    imageFiles: File[]
  ): Promise<ImageUploadResponse> {
    const formData = new FormData()
    
    imageFiles.forEach(file => {
      formData.append('images', file)
    })

    const response = await apiClient.post<ImageUploadResponse>(
      `/api/rooms/${roomId}/upload_images/${imageType}/`, 
      formData
    )
    
    return response.data
  }

  /**
   * Delete multiple room images by IDs
   * Matches: DELETE /api/rooms/images/bulk/
   */
  public static async deleteRoomImages(imageIds: number[]): Promise<ImageDeleteResponse> {
    const response = await apiClient.delete<ImageDeleteResponse>(
      '/api/rooms/images/bulk/',
      {
        includeAuth: true,
        data: { image_ids: imageIds }
      }
    )
    return response.data
  }

  /**
   * Create new room (Owner only)
   * Matches: POST /api/rooms/
   */
  public static async createRoom(roomData: CreateRoomPayload): Promise<Room> {
    const response = await apiClient.post<Room>('/api/rooms/', roomData)
    return response.data
  }

  /**
   * Update room (Owner only)
   * Matches: PUT /api/rooms/{id}/
   */
  public static async updateRoom(id: number, roomData: Partial<CreateRoomPayload>): Promise<Room> {
    const response = await apiClient.put<Room>(`/api/rooms/${id}/`, roomData)
    return response.data
  }

  /**
   * Partially update room (Owner only)
   * Matches: PATCH /api/rooms/{id}/
   */
  public static async patchRoom(id: number, roomData: Partial<CreateRoomPayload>): Promise<Room> {
    const response = await apiClient.patch<Room>(`/api/rooms/${id}/`, roomData)
    return response.data
  }

  /**
   * Delete room (Owner only)
   * Matches: DELETE /api/rooms/{id}/
   */
  public static async deleteRoom(id: number): Promise<void> {
    await apiClient.delete(`/api/rooms/${id}/`)
  }

  /**
   * Get owner's rooms
   * Matches: GET /api/rooms/my_rooms/
   */
  public static async getMyRooms(): Promise<Room[]> {
    const response = await apiClient.get<Room[]>('/api/rooms/my_rooms/')
    return response.data
  }

  // ================= UTILITY METHODS =================

  /**
   * Build filter object for common room queries
   */
  public static buildFilters(options: {
    status?: number // 1 for available, 0 for others
    featured?: boolean
    verified?: boolean
    hasMezzanine?: boolean
    priceRange?: [number, number]
    areaRange?: [number, number]
    maxPeople?: number
    search?: string
    sortBy?: 'price' | 'area' | 'date'
    sortOrder?: 'asc' | 'desc'
  }): RoomFilters {
    const filters: RoomFilters = {}

    if (options.status !== undefined) filters.status = options.status
    if (options.featured !== undefined) filters.is_featured = options.featured
    if (options.verified !== undefined) filters.is_verified = options.verified
  if (options.hasMezzanine !== undefined) filters.has_mezzanine = options.hasMezzanine
    if (options.maxPeople) filters.max_people = options.maxPeople
    if (options.search) filters.search = options.search

    // Price range
    if (options.priceRange) {
      if (options.priceRange[0] > 0) filters.min_price = options.priceRange[0]
      if (options.priceRange[1] > 0) filters.max_price = options.priceRange[1]
    }

    // Area range
    if (options.areaRange) {
      if (options.areaRange[0] > 0) filters.min_area = options.areaRange[0]
      if (options.areaRange[1] > 0) filters.max_area = options.areaRange[1]
    }

    // Sorting
    if (options.sortBy) {
      const direction = options.sortOrder === 'desc' ? '-' : ''
      let field: string = options.sortBy
      if (field === 'date') field = 'created_at'
      filters.ordering = `${direction}${field}` as RoomFilters['ordering']
    }

    return filters
  }

  /**
   * Get the main image URL for a room
   */
  public static getRoomMainImage(room: Room): string {
    // First: Use main_image_url from backend if available
    if (room.main_image_url) {
      return room.main_image_url
    }
    
    // Fallback: Find main image in images array
    const mainImage = room.images?.find(img => img.image_type === 'main')
    if (mainImage) {
      // Use optimized version for display, original for fallback
      return mainImage.optimized_url || mainImage.original_url
    }
    
    // Fallback: Use first image if any
    if (room.images && room.images.length > 0) {
      return room.images[0].optimized_url || room.images[0].original_url
    }
    
    // Return fallback image if no main image
    return '/placeholder.jpg'
  }

  /**
   * Get original image URL for zoom/full view
   */
  public static getRoomOriginalImage(room: Room, imageType: string = 'main'): string {
    const image = room.images?.find(img => img.image_type === imageType)
    return image?.original_url || '/placeholder.jpg'
  }

  /**
   * Get optimized image URL for display
   */
  public static getRoomOptimizedImage(room: Room, imageType: string = 'main'): string {
    const image = room.images?.find(img => img.image_type === imageType)
    return image?.optimized_url || image?.original_url || '/placeholder.jpg'
  }

  /**
   * Validate and fix image URL if needed
   */
  public static getValidImageUrl(imageUrl?: string): string {
    if (!imageUrl) return '/placeholder.jpg'
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // If it's a relative path, might need to prepend bucket URL
    // But backend should already return full URLs from GCS
    return imageUrl
  }

  /**
   * Group images by type
   */
  public static groupImagesByType(images: RoomImage[]): Record<string, RoomImage[]> {
    return images.reduce((acc, img) => {
      if (!acc[img.image_type]) {
        acc[img.image_type] = []
      }
      acc[img.image_type].push(img)
      return acc
    }, {} as Record<string, RoomImage[]>)
  }

  /**
   * Sort images by order
   */
  public static sortImagesByOrder(images: RoomImage[]): RoomImage[] {
    return [...images].sort((a, b) => a.order - b.order)
  }

  /**
   * Format room price for display
   */
  public static formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  /**
   * Check if room is available
   */
  public static isRoomAvailable(room: Room): boolean {
    return room.status === 1
  }
}

export default RoomsService