/**
 * Find Roomie Constants
 * =====================
 * Centralized constants for the Find Roomie feature
 */

/**
 * Default avatar image path
 * Used when user has no profile picture (avatar_url is null)
 */
export const DEFAULT_ROOMIE_AVATAR = '/images/mock-findroomie/placeholder-user.jpg'

/**
 * Display labels for gender values
 */
export const GENDER_LABELS = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
} as const

/**
 * Display labels for occupation types
 */
export const OCCUPATION_LABELS = {
  student: 'Sinh viên',
  working: 'Đã đi làm',
} as const

/**
 * Display labels for activity time / lifestyle
 */
export const ACTIVITY_TIME_LABELS = {
  day: 'Ban ngày',
  night: 'Ban đêm',
  flexible: 'Linh hoạt',
} as const

/**
 * Default values
 */
export const FIND_ROOMIE_DEFAULTS = {
  AVATAR: '/images/mock-findroomie/placeholder-user.jpg',
  SORT_ORDER: '-created_at',
  PAGE_SIZE: 20,
  SIMILAR_ROOMIES_COUNT: 4,
  SIMILAR_AGE_RANGE: 5, // years
} as const
