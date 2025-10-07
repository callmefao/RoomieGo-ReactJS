// Room interfaces matching Django Tro4S API response structure

export interface RoomImage {
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

export interface Room {
  id: number
  title: string
  price: number
  area: number
  location: string
  latitude: string  // API trả về string format tọa độ
  longitude: string // API trả về string format tọa độ
  status: number // 1 = approved/open, 0 = pending/closed
  owner?: RoomOwner // Optional for backward compatibility
  images: RoomImage[]
  main_image_url?: string // URL của main image từ backend
  
  // Optional detailed fields
  description?: string
  contact_phone?: string
  max_people?: number
  deposit?: number
  electricity_price?: number
  water_price?: number
  internet_price?: number
  parking_price?: number
  amenities?: string[]
  house_rules?: string
  minimum_stay_months?: number
  created_at?: string
  updated_at?: string
  view_count?: number
  favorite_count?: number
  meta_description?: string
  verified_at?: string
  verified_by?: number
  contact_hours?: string
  is_featured?: boolean
  is_verified?: boolean
  owner_username?: string // From backend serializer
  total_monthly_cost?: number
}

export interface Amenity {
  id: number
  name: string
  category: string
  icon?: string
  is_default?: boolean
}

// Room filtering parameters matching Django API
export interface RoomFilters {
  status?: number // 1 for available, 0 for others
  is_featured?: boolean
  is_verified?: boolean
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
  house_rules?: string
  minimum_stay_months?: number
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
