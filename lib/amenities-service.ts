/**
 * Amenities Service
 * Handles fetching and caching amenities from the backend API
 */

import { apiClient } from './api-client'

export interface Amenity {
  id: number
  name: string
  icon_url: string
}

export interface AmenitiesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Amenity[]
}

class AmenitiesService {
  private cache: Amenity[] | null = null
  private cacheTimestamp: number | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch all amenities from the API
   * Results are cached for 5 minutes to reduce API calls
   */
  public async fetchAmenities(): Promise<Amenity[]> {
    // Check if cache is valid
    if (this.cache && this.cacheTimestamp) {
      const now = Date.now()
      if (now - this.cacheTimestamp < this.CACHE_DURATION) {
        console.log('✅ Using cached amenities')
        return this.cache
      }
    }

    try {
      console.log('🔄 Fetching amenities from API...')
      const response = await apiClient.get<AmenitiesResponse>('/api/rooms/amenities/', {
        includeAuth: false,
      })

      this.cache = response.data.results
      this.cacheTimestamp = Date.now()

      console.log(`✅ Fetched ${this.cache.length} amenities`)
      return this.cache
    } catch (error) {
      console.error('❌ Error fetching amenities:', error)
      throw error
    }
  }

  /**
   * Clear the cache (useful for testing or forced refresh)
   */
  public clearCache(): void {
    this.cache = null
    this.cacheTimestamp = null
  }

  /**
   * Get a specific amenity by ID from cache
   */
  public getAmenityById(id: number): Amenity | undefined {
    return this.cache?.find((amenity) => amenity.id === id)
  }
}

// Export singleton instance
export const amenitiesService = new AmenitiesService()
