/**
 * Chatbot Helpers - Extract structured data from API responses
 * =============================================================
 * 
 * Simple utility functions to extract rooms and details from
 * chatbot function_results (NO MORE REGEX!)
 */

import type { Room, FunctionResult, ChatResponse } from '@/lib/chatbot-service'

/**
 * Extract search results from chatbot response
 */
export function getRooms(response: ChatResponse): Room[] {
  if (!response.function_results) return []
  
  const result = response.function_results.find(
    r => r.function_name === 'search_rooms'
  )
  
  return result?.data.success ? (result.data.rooms || []) : []
}

/**
 * Extract room details from chatbot response
 */
export function getRoomDetails(response: ChatResponse): Room | null {
  if (!response.function_results) return null
  
  const result = response.function_results.find(
    r => r.function_name === 'get_room_details'
  )
  
  return result?.data.success ? (result.data.room || null) : null
}

/**
 * Extract recommended/similar rooms from chatbot response
 */
export function getSimilarRooms(response: ChatResponse): Room[] {
  if (!response.function_results) return []
  
  const result = response.function_results.find(
    r => r.function_name === 'recommend_similar_rooms'
  )
  
  return result?.data.success ? (result.data.similar_rooms || []) : []
}

/**
 * Check if response has structured room data
 */
export function hasRoomData(response: ChatResponse): boolean {
  return !!response.function_results && response.function_results.length > 0
}

/**
 * Format price for display (Vietnamese)
 */
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} triệu`
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Format utility price (electricity/water)
 */
export function formatUtilityPrice(price: number | null, unit: string = 'đ'): string {
  if (price === null) return 'Thỏa thuận'
  return `${price.toLocaleString('vi-VN')}${unit}`
}

/**
 * Generate room detail URL from room ID and title
 */
export function generateRoomUrl(room: Room): string {
  const slug = room.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  return `/${slug}-${room.id}`
}
