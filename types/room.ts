// Room interfaces matching Django Tro4S API response structure

export interface RoomImage {
  image_id: number
  id?: number
  original_url: string
  optimized_url: string
  image_type: 'main' | 'interior' | 'exterior' | 'bathroom' | 'kitchen' | 'parking' | 'laundry' | '360' | 'normal'
  order: number
  image_format: string
}

export interface RoomOwner {
  id: number
  username: string
}

export interface RoomAmenityDetail {
  id?: number
  name: string
  icon_url?: string
  icon?: string
  slug?: string
  category?: string
  is_default?: boolean
}

export interface Room {
  id: number
  title: string
  price: number
  area: number
  location: string
  status: number // 1 = approved/open, 0 = pending/closed
  
  // Fields from /api/rooms/ list endpoint (always present, can be null)
  deposit: number | null
  electricity_price: number | null
  water_price: number | null
  max_people: number | null
  has_mezzanine: boolean
  created_at: string
  is_featured: boolean
  view_count: number
  main_image_url: string
  owner_username: string
  
  // Optional fields (may not be in list response, present in detail)
  latitude?: string  // API trả về string format tọa độ
  longitude?: string // API trả về string format tọa độ
  owner?: RoomOwner
  images?: RoomImage[]
  description?: string
  contact_phone?: string
  internet_price?: number | null
  parking_price?: number | null
  amenities?: string[]
  amenities_detail?: RoomAmenityDetail[]
  house_rules?: string
  minimum_stay_months?: number
  updated_at?: string
  favorite_count?: number
  meta_description?: string
  verified_at?: string
  verified_by?: number
  contact_hours?: string
  is_verified?: boolean
  total_monthly_cost?: number
}

export interface PendingRoom extends Room {
  submitted_at?: string
  owner_name?: string
  owner_email?: string
  owner_phone?: string
}

export interface PendingRoomsResponse {
  count: number
  next: string | null
  previous: string | null
  results: PendingRoom[]
}

export interface Amenity extends RoomAmenityDetail {
  description?: string
  display_order?: number
}

// Room filtering parameters matching Django API
export interface RoomFilters {
  status?: number // 1 for available, 0 for others
  is_featured?: boolean
  is_verified?: boolean
  has_mezzanine?: boolean
  amenities?: string // Comma-separated amenity IDs: "1,2,5"
  min_price?: number
  max_price?: number
  min_area?: number
  max_area?: number
  max_people?: number
  search?: string
  ordering?: 'price' | '-price' | 'area' | '-area' | 'created_at' | '-created_at'
}

// API Response structure with Django REST pagination
export interface RoomsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Room[]
}

// Room creation/update payload
export interface CreateRoomPayload {
  title: string
  price: number
  location: string
  area: number
  description: string
  contact_phone: string
  max_people?: number
  deposit?: number
  electricity_price?: number
  water_price?: number
  internet_price?: number
  parking_price?: number
  amenities?: string[]
  amenity_ids?: number[]
  house_rules?: string
  minimum_stay_months?: number
  has_mezzanine?: boolean
  latitude?: number
  longitude?: number
  contact_hours?: string
  image_files?: File[]
}

// API Response for image upload
export interface ImageUploadResponse {
  message: string
  image_type: string
  uploaded_images: RoomImage[]
  success_count: number
  error_count: number
  errors: any[]
}

export interface ImageDeleteResponse {
  message: string
  deleted_count: number
  failed_count: number
  deleted_ids: number[]
  failed_images: any[]
}

// Review interface
export interface Review {
  id: number
  user: number
  user_username: string
  room: number
  room_title: string
  rating: number
  content: string
  created_at: string
}

// Favorite interface
export interface Favorite {
  id: number
  user: number
  room: number
  room_title: string
  room_price: number
  created_at: string
}
