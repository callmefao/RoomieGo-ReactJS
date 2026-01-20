/**
 * FindRoomie Service
 * ==================
 * Handles all API calls related to finding roommates.
 * This service provides a clean interface for fetching roommate listings with filters.
 */

import { apiClient } from './api-client'

// API Response structure matching backend
export interface FindRoomieApiResponse {
  id: number
  username: string
  title: string
  full_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  gender_display: string
  avatar_url: string | null
  occupation: 'student' | 'working'
  occupation_display: string
  workplace_or_school?: string
  activity_time: 'day' | 'night' | 'flexible'
  activity_time_display: string
  location_description: string
  
  // District info (from locations app)
  district_name?: string
  district_slug?: string
  
  budget_min: number
  budget_max: number
  self_description?: string
  roommate_requirements?: string
  additional_notes?: string
  contact_phone?: string
  contact_hours?: string
  contact_zalo?: string
  contact_facebook?: string
  status: string
  created_at: string
  view_count: number
  
  // GPS coordinates (OPTIONAL)
  latitude?: number
  longitude?: number
}

export interface FindRoomiePaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: FindRoomieApiResponse[]
}

// Filter parameters for API
export interface FindRoomieFilters {
  // District filter (PRIMARY filter)
  district?: string | number // District slug or ID
  
  gender?: 'male' | 'female' | 'other'
  occupation?: 'student' | 'working'
  activity_time?: 'day' | 'night' | 'flexible'
  min_age?: number
  max_age?: number
  min_budget?: number
  max_budget?: number
  
  // GPS coordinates (OPTIONAL for refinement)
  latitude?: number
  longitude?: number
  radius?: number
  
  search?: string
  ordering?: string
  page?: number
}

class FindRoomieService {
  private baseEndpoint = '/api/findroomie/'

  /**
   * Get list of roommate posts with optional filters
   * 
   * Primary filter: district (slug or ID)
   * Example: getRoommates({ district: 'ninh-kieu' })
   * Example: getRoommates({ district: 1, gender: 'male', min_budget: 1000000 })
   */
  async getRoommates(filters?: FindRoomieFilters): Promise<FindRoomiePaginatedResponse> {
    try {
      const response = await apiClient.get<FindRoomiePaginatedResponse>(
        this.baseEndpoint,
        {
          params: filters,
          includeAuth: false, // Optional auth according to API spec
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching roommates:', error)
      throw error
    }
  }

  /**
   * Get current user's roommate posts
   */
  async getMyPosts(): Promise<FindRoomiePaginatedResponse> {
    try {
      const response = await apiClient.get<FindRoomiePaginatedResponse>(
        `${this.baseEndpoint}my_posts/`,
        {
          includeAuth: true, // Authentication required
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching my posts:', error)
      throw error
    }
  }

  /**
   * Get single roommate post by ID
   */
  async getRoommateById(id: number): Promise<FindRoomieApiResponse> {
    try {
      const response = await apiClient.get<FindRoomieApiResponse>(
        `${this.baseEndpoint}${id}/`,
        {
          includeAuth: false,
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching roommate #${id}:`, error)
      throw error
    }
  }

  /**
   * Create new roommate post (requires authentication)
   */
  async createRoommate(data: Partial<FindRoomieApiResponse>): Promise<FindRoomieApiResponse> {
    try {
      const response = await apiClient.post<FindRoomieApiResponse>(
        this.baseEndpoint,
        data,
        {
          includeAuth: true,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating roommate post:', error)
      throw error
    }
  }

  /**
   * Update roommate post (requires authentication)
   */
  async updateRoommate(id: number, data: Partial<FindRoomieApiResponse>): Promise<FindRoomieApiResponse> {
    try {
      const response = await apiClient.patch<FindRoomieApiResponse>(
        `${this.baseEndpoint}${id}/`,
        data,
        {
          includeAuth: true,
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error updating roommate #${id}:`, error)
      throw error
    }
  }

  /**
   * Delete roommate post (requires authentication)
   */
  async deleteRoommate(id: number): Promise<void> {
    try {
      await apiClient.delete(
        `${this.baseEndpoint}${id}/`,
        {
          includeAuth: true,
        }
      )
    } catch (error) {
      console.error(`Error deleting roommate #${id}:`, error)
      throw error
    }
  }

  /**
   * Upload avatar for roommate post (requires authentication)
   * @param id - Roommate post ID
   * @param file - Image file to upload
   * @returns Updated roommate post with new avatar URL
   */
  async uploadAvatar(id: number, file: File): Promise<FindRoomieApiResponse> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await apiClient.post<FindRoomieApiResponse>(
        `${this.baseEndpoint}${id}/upload_avatar/`,
        formData,
        {
          includeAuth: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error uploading avatar for roommate #${id}:`, error)
      throw error
    }
  }
}

// Export singleton instance
export const findRoomieService = new FindRoomieService()
export default FindRoomieService
