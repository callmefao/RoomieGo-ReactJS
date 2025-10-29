// User interfaces for admin management

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  // Include 'staff' to align with ApiUser.role
  role: "admin" | "staff" | "owner" | "user"
  status: "active" | "inactive" | "suspended"
  created_at: string
  last_login?: string
  avatar?: string
  total_rooms?: number
  total_reviews?: number
}

export interface UserFilters {
  role?: "admin" | "staff" | "owner" | "user"
  status?: "active" | "inactive" | "suspended"
  search?: string
}

export interface ApiUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  is_owner: boolean
  date_joined: string
  role: "admin" | "staff" | "owner" | "user"
}
