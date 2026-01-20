/**
 * Location Types - Districts and Universities
 * ==========================================
 * 
 * TypeScript interfaces for the Locations API
 * Matches Django backend locations app models
 */

/**
 * Geographic coordinate (latitude, longitude)
 */
export interface Location {
  lat: number
  lng: number
}

/**
 * District (Quận/Huyện) in Cần Thơ city
 */
export interface District {
  id: number
  name: string
  slug: string
  center: Location
  universities_count: number
  order: number
}

/**
 * District detail (same as District for now, can be extended)
 */
export interface DistrictDetail extends District {
  // Can add more fields in the future
}

/**
 * Nested district info (returned in University detail)
 */
export interface DistrictInfo {
  id: number
  name: string
  slug: string
}

/**
 * University (Trường học)
 */
export interface University {
  id: number
  code: string // Unique code like "fptu-ct", "ctu"
  name: string // Full name: "Đại học FPT Cần Thơ"
  short_name: string // Short name: "ĐH FPT CT"
  location: Location
  district?: DistrictInfo // Optional, present in list endpoint
  search_radius_km: number // Default 3km for GPS search
  is_active: boolean
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Filters for universities endpoint
 */
export interface UniversityFilters {
  district?: number // Filter by district ID
  search?: string // Search by name/code
  is_active?: boolean // Filter active only (default: true)
}
