/**
 * Find Roomie Data Mappers
 * =========================
 * Helper functions to map between API response and frontend Roomie type
 */

import type { Roomie, Gender, OccupationType, LifestyleType } from '@/types/roomie'
import type { FindRoomieApiResponse } from '@/lib/findroomie-service'
import { 
  DEFAULT_ROOMIE_AVATAR,
  GENDER_LABELS,
  OCCUPATION_LABELS,
  ACTIVITY_TIME_LABELS,
} from './findroomie-constants'

/**
 * Map API gender to frontend Gender type
 */
function mapGender(apiGender: 'male' | 'female' | 'other'): Gender {
  return GENDER_LABELS[apiGender] || 'Khác'
}

/**
 * Map API occupation to frontend OccupationType
 */
function mapOccupation(apiOccupation: 'student' | 'working'): OccupationType {
  return OCCUPATION_LABELS[apiOccupation] || 'Đã đi làm'
}

/**
 * Map API activity_time to frontend LifestyleType
 */
function mapLifestyle(apiActivityTime: 'day' | 'night' | 'flexible'): LifestyleType {
  return ACTIVITY_TIME_LABELS[apiActivityTime] || 'Linh hoạt'
}

/**
 * Parse preferences from roommate requirements text
 * Extracts key requirements into an array
 */
function parsePreferences(requirements?: string, additionalNotes?: string): string[] {
  const preferences: string[] = []
  
  const text = [requirements, additionalNotes].filter(Boolean).join(' ')
  
  // Common preference keywords
  const keywords = [
    { pattern: /sạch\s*sẽ|gọn\s*gàng|ngăn\s*nắp/i, value: 'Sạch sẽ, ngăn nắp' },
    { pattern: /không\s*hút\s*thuốc|ko\s*hút\s*thuốc/i, value: 'Không hút thuốc' },
    { pattern: /không\s*nuôi\s*thú|ko\s*nuôi\s*thú/i, value: 'Không nuôi thú cưng' },
    { pattern: /ít\s*ồn|yên\s*tĩnh|không\s*ồn/i, value: 'Yên tĩnh' },
    { pattern: /thân\s*thiện|hòa\s*đồng|dễ\s*gần/i, value: 'Thân thiện, hòa đồng' },
    { pattern: /tôn\s*trọng\s*riêng\s*tư/i, value: 'Tôn trọng riêng tư' },
  ]
  
  keywords.forEach(({ pattern, value }) => {
    if (pattern.test(text) && !preferences.includes(value)) {
      preferences.push(value)
    }
  })
  
  return preferences.length > 0 ? preferences : ['Cởi mở', 'Dễ gần']
}

/**
 * Parse preferred areas from location description
 */
function parsePreferredAreas(locationDescription?: string): string[] {
  if (!locationDescription) {
    return ['Cần Thơ']
  }
  
  // If it contains comma-separated areas, split them
  if (locationDescription.includes(',')) {
    return locationDescription.split(',').map(area => area.trim())
  }
  
  return [locationDescription]
}

/**
 * Determine room type from requirements
 */
function determineRoomType(requirements?: string): string {
  if (!requirements) return 'Phòng trọ'
  
  const text = requirements.toLowerCase()
  if (text.includes('chung cư') || text.includes('căn hộ')) {
    return 'Căn hộ chung cư'
  }
  if (text.includes('nhà nguyên căn') || text.includes('nguyên căn')) {
    return 'Nhà nguyên căn'
  }
  if (text.includes('studio')) {
    return 'Studio'
  }
  return 'Phòng trọ'
}

/**
 * Map API response to frontend Roomie type
 */
export function mapApiResponseToRoomie(apiResponse: FindRoomieApiResponse): Roomie {
  return {
    id: apiResponse.id,
    name: apiResponse.full_name,
    age: apiResponse.age,
    gender: mapGender(apiResponse.gender),
    occupation: mapOccupation(apiResponse.occupation),
    school: apiResponse.workplace_or_school,
    avatar: apiResponse.avatar_url || DEFAULT_ROOMIE_AVATAR,
    description: apiResponse.self_description || apiResponse.title || '',
    preferred_areas: parsePreferredAreas(apiResponse.location_description),
    room_type: determineRoomType(apiResponse.roommate_requirements),
    budget_min: apiResponse.budget_min,
    budget_max: apiResponse.budget_max,
    preferences: parsePreferences(apiResponse.roommate_requirements, apiResponse.additional_notes),
    lifestyle: mapLifestyle(apiResponse.activity_time),
    additional_requirements: apiResponse.additional_notes,
    contact_phone: apiResponse.contact_phone,
    contact_hours: apiResponse.contact_hours,
    created_at: apiResponse.created_at,
    view_count: apiResponse.view_count,
    is_featured: apiResponse.view_count > 100, // Featured if high view count
  }
}

/**
 * Map frontend Gender to API gender
 */
export function mapGenderToApi(gender: Gender): 'male' | 'female' | 'other' {
  switch (gender) {
    case 'Nam':
      return 'male'
    case 'Nữ':
      return 'female'
    case 'Khác':
      return 'other'
    default:
      return 'other'
  }
}

/**
 * Map frontend OccupationType to API occupation
 */
export function mapOccupationToApi(occupation: OccupationType): 'student' | 'working' {
  return occupation === 'Sinh viên' ? 'student' : 'working'
}

/**
 * Map frontend LifestyleType to API activity_time
 */
export function mapLifestyleToApi(lifestyle: LifestyleType): 'day' | 'night' | 'flexible' {
  switch (lifestyle) {
    case 'Ban ngày':
      return 'day'
    case 'Ban đêm':
      return 'night'
    case 'Linh hoạt':
      return 'flexible'
    default:
      return 'flexible'
  }
}

/**
 * Map API gender back to frontend Gender type (reverse mapping for editing)
 */
export function mapGenderFromApi(apiGender: 'male' | 'female' | 'other'): Gender {
  return mapGender(apiGender)
}

/**
 * Map API occupation back to frontend OccupationType (reverse mapping for editing)
 */
export function mapOccupationFromApi(apiOccupation: 'student' | 'working'): OccupationType {
  return mapOccupation(apiOccupation)
}

/**
 * Map API activity_time back to frontend LifestyleType (reverse mapping for editing)
 */
export function mapLifestyleFromApi(apiActivityTime: 'day' | 'night' | 'flexible'): LifestyleType {
  return mapLifestyle(apiActivityTime)
}
