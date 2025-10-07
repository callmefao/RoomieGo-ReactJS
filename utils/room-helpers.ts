/**
 * Room Utilities
 * Các helper functions cho Room data từ API
 */

import { Room, RoomImage } from "@/types/room"

/**
 * Map amenities keys từ API thành display names tiếng Việt
 */
export const AMENITY_DISPLAY_NAMES: Record<string, string> = {
  // Basic amenities
  'wifi': 'WiFi miễn phí',
  'air_conditioner': 'Máy lạnh',
  'private_bathroom': 'Phòng tắm riêng',
  'parking': 'Chỗ đậu xe',
  'elevator': 'Thang máy',
  'security': 'An ninh 24/7',
  
  // Kitchen & Living
  'kitchen': 'Nhà bếp',
  'refrigerator': 'Tủ lạnh',
  'washing_machine': 'Máy giặt',
  'water_heater': 'Nước nóng',
  'balcony': 'Ban công',
  'window': 'Cửa sổ thoáng',
  
  // Furniture
  'bed': 'Giường',
  'wardrobe': 'Tủ quần áo',
  'desk': 'Bàn làm việc',
  'chair': 'Ghế',
  'tv': 'Ti vi',
  'sofa': 'Sofa',
  
  // Utilities
  'cable_tv': 'Truyền hình cáp',
  'internet': 'Internet',
  'phone': 'Điện thoại',
  'fire_extinguisher': 'Bình cứu hỏa',
  'first_aid': 'Tủ thuốc y tế',
  
  // Location benefits
  'near_university': 'Gần trường đại học',
  'near_market': 'Gần chợ',
  'near_hospital': 'Gần bệnh viện',
  'near_bus_stop': 'Gần trạm xe buýt',
  'quiet_area': 'Khu vực yên tĩnh',
}

/**
 * Format amenities từ API keys thành display names
 */
export function formatAmenities(amenities: string[] | undefined): string[] {
  if (!amenities) return []
  
  return amenities.map(amenity => 
    AMENITY_DISPLAY_NAMES[amenity] || amenity
  )
}

/**
 * Group images by type và sort by order
 */
export function groupImagesByType(images: RoomImage[]) {
  const grouped = images.reduce((acc, img) => {
    if (!acc[img.image_type]) {
      acc[img.image_type] = []
    }
    acc[img.image_type].push(img)
    return acc
  }, {} as Record<string, RoomImage[]>)
  
  // Sort images within each group by order
  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => a.order - b.order)
  })
  
  return grouped
}

/**
 * Get display name cho image type
 */
export function getImageTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    'main': 'Ảnh chính',
    'interior': 'Nội thất', 
    'exterior': 'Bên ngoài',
    'bathroom': 'Phòng tắm',
    'kitchen': 'Nhà bếp',
    'parking': 'Chỗ đậu xe',
    'laundry': 'Phơi đồ',
    '360': 'Ảnh 360°',
    'normal': 'Ảnh khác'
  }
  return displayNames[type] || 'Ảnh khác'
}

/**
 * Get main image URL từ Room data
 */
export function getMainImageUrl(room: Room): string {
  // Priority: main_image_url từ API > main type image > first image > placeholder
  if (room.main_image_url) {
    return room.main_image_url
  }
  
  const mainImage = room.images?.find(img => img.image_type === 'main')
  if (mainImage) {
    return mainImage.optimized_url || mainImage.original_url
  }
  
  const firstImage = room.images?.[0]
  if (firstImage) {
    return firstImage.optimized_url || firstImage.original_url
  }
  
  return '/placeholder.jpg'
}

/**
 * Format price thành VND
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Validate tọa độ GPS
 */
export function validateCoordinates(lat: string | undefined, lng: string | undefined): boolean {
  if (!lat || !lng) return false
  
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  
  // Kiểm tra tọa độ hợp lệ cho Việt Nam
  // Lat: 8° - 24°N, Lng: 102° - 110°E
  return latitude >= 8 && latitude <= 24 && longitude >= 102 && longitude <= 110
}

/**
 * Parse tọa độ từ string thành number
 */
export function parseCoordinates(lat: string, lng: string): { lat: number, lng: number } {
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  }
}

/**
 * Calculate total monthly cost including utilities
 */
export function calculateTotalMonthlyCost(room: Room): number {
  const baseCost = room.price || 0
  const internet = room.internet_price || 0
  const parking = room.parking_price || 0
  
  // Không tính electricity và water vì thay đổi theo usage
  return baseCost + internet + parking
}

/**
 * Get room status display
 */
export function getRoomStatusDisplay(status: number): { text: string, color: string } {
  switch (status) {
    case 1:
      return { text: 'Còn trống', color: 'text-green-600' }
    case 0:
      return { text: 'Đã cho thuê', color: 'text-red-600' }
    default:
      return { text: 'Không xác định', color: 'text-gray-600' }
  }
}