/**
 * Locations Service - API calls for Districts and Universities
 * ===========================================================
 * 
 * This service handles all location-related API operations:
 * - Fetching districts (Quận/Huyện)
 * - Fetching universities (Trường học)
 * - District-University relationships
 * 
 * Based on the new backend locations app API endpoints
 */

import { apiClient } from './api-client'
import type {
  District,
  DistrictDetail,
  University,
  PaginatedResponse,
  UniversityFilters,
} from '../types/location'

// ============== SERVICE CLASS ==============

export class LocationsService {
  
  /**
   * Lấy danh sách tất cả quận/huyện
   * GET /api/locations/districts/
   * 
   * @returns Promise<District[]> - Danh sách districts
   */
  public static async getDistricts(): Promise<District[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<District>>(
        '/api/locations/districts/'
      )
      return response.data.results
    } catch (error) {
      console.error('Error fetching districts:', error)
      throw error
    }
  }

  /**
   * Lấy chi tiết một quận/huyện
   * GET /api/locations/districts/{id}/
   * 
   * @param id - District ID
   * @returns Promise<DistrictDetail>
   */
  public static async getDistrictDetail(id: number): Promise<DistrictDetail> {
    try {
      const response = await apiClient.get<DistrictDetail>(
        `/api/locations/districts/${id}/`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching district ${id}:`, error)
      throw error
    }
  }

  /**
   * Lấy danh sách trường học trong một quận
   * GET /api/locations/districts/{id}/universities/
   * 
   * Note: Endpoint này trả về array trực tiếp, không có pagination
   * 
   * @param districtId - District ID
   * @returns Promise<University[]>
   */
  public static async getUniversitiesInDistrict(districtId: number): Promise<University[]> {
    try {
      const response = await apiClient.get<University[]>(
        `/api/locations/districts/${districtId}/universities/`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching universities in district ${districtId}:`, error)
      throw error
    }
  }

  /**
   * Lấy danh sách tất cả trường học
   * GET /api/locations/universities/
   * 
   * @param filters - Optional filters
   * @param filters.district - Filter by district ID
   * @param filters.search - Search by name/code
   * @param filters.is_active - Filter active universities only (default: true)
   * @returns Promise<University[]>
   */
  public static async getUniversities(filters?: UniversityFilters): Promise<University[]> {
    try {
      const params: Record<string, any> = {}
      
      if (filters?.district) {
        params.district = filters.district
      }
      if (filters?.search) {
        params.search = filters.search
      }
      if (filters?.is_active !== undefined) {
        params.is_active = filters.is_active
      }

      const response = await apiClient.get<PaginatedResponse<University>>(
        '/api/locations/universities/',
        { params }
      )
      
      return response.data.results
    } catch (error) {
      console.error('Error fetching universities:', error)
      throw error
    }
  }

  /**
   * Lấy chi tiết một trường học bằng code
   * GET /api/locations/universities/{code}/
   * 
   * @param code - University code (e.g., "fptu-ct")
   * @returns Promise<University>
   */
  public static async getUniversityByCode(code: string): Promise<University> {
    try {
      const response = await apiClient.get<University>(
        `/api/locations/universities/${code}/`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching university ${code}:`, error)
      throw error
    }
  }

  /**
   * Helper: Lấy districts và cache trong localStorage
   * Dùng để tránh gọi API nhiều lần cho dropdown
   * 
   * @param forceRefresh - Force fetch from API, skip cache
   * @returns Promise<District[]>
   */
  public static async getDistrictsCached(forceRefresh = false): Promise<District[]> {
    const CACHE_KEY = 'tro4s_districts_cache'
    const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

    if (typeof window === 'undefined') {
      // Server-side: không cache
      return this.getDistricts()
    }

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const isExpired = Date.now() - timestamp > CACHE_DURATION
          
          if (!isExpired) {
            return data as District[]
          }
        }
      } catch (error) {
        console.warn('Error reading districts cache:', error)
      }
    }

    // Fetch fresh data
    const districts = await this.getDistricts()
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: districts,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Error caching districts:', error)
    }

    return districts
  }

  /**
   * Helper: Lấy universities và cache trong localStorage
   * 
   * @param forceRefresh - Force fetch from API, skip cache
   * @returns Promise<University[]>
   */
  public static async getUniversitiesCached(forceRefresh = false): Promise<University[]> {
    const CACHE_KEY = 'tro4s_universities_cache'
    const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

    if (typeof window === 'undefined') {
      // Server-side: không cache
      return this.getUniversities()
    }

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const isExpired = Date.now() - timestamp > CACHE_DURATION
          
          if (!isExpired) {
            return data as University[]
          }
        }
      } catch (error) {
        console.warn('Error reading universities cache:', error)
      }
    }

    // Fetch fresh data
    const universities = await this.getUniversities()
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: universities,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Error caching universities:', error)
    }

    return universities
  }
}

// Export default instance for convenience
export const locationsService = LocationsService
