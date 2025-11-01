// Roomie (Find Roommate) interfaces for the platform

export type Gender = "Nam" | "Nữ" | "Khác"
export type OccupationType = "Đã đi làm" | "Sinh viên"
export type LifestyleType = "Ban ngày" | "Ban đêm" | "Linh hoạt"

export interface Roomie {
  id: number
  name: string
  age: number
  gender: Gender
  occupation: OccupationType
  school?: string // Chỉ có khi occupation là "Sinh viên"
  avatar: string
  description: string
  
  // Tiêu chí tìm bạn ở ghép
  preferred_areas: string[]
  room_type: string
  budget_min: number
  budget_max: number
  preferences: string[] // VD: ["Sạch sẽ", "Nữ", "Không hút thuốc"]
  lifestyle: LifestyleType
  additional_requirements?: string
  
  // Thông tin liên hệ
  contact_phone?: string
  contact_hours?: string
  
  // Metadata
  created_at: string
  view_count?: number
  is_featured?: boolean
}

// Filter parameters for finding roommates
export interface RoomieFilters {
  // Kế thừa từ rental-listings
  search?: string
  min_price?: number
  max_price?: number
  latitude?: number
  longitude?: number
  radius?: number
  amenities?: string
  
  // Các field bổ sung cho Find Roomie
  occupation?: OccupationType
  school?: string
  min_age?: number
  max_age?: number
  gender?: Gender
  lifestyle?: LifestyleType
  room_type?: string
  preferred_area?: string
}

// API Response structure (giống pattern của Room)
export interface RoomiesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Roomie[]
}

// Payload for creating/updating roomie profile
export interface CreateRoomiePayload {
  name: string
  age: number
  gender: Gender
  occupation: OccupationType
  school?: string
  description: string
  preferred_areas: string[]
  room_type: string
  budget_min: number
  budget_max: number
  preferences: string[]
  lifestyle: LifestyleType
  additional_requirements?: string
  contact_phone?: string
  contact_hours?: string
  avatar_file?: File
}
