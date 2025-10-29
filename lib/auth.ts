import { apiClient } from "./api-client"
import type { ApiUser } from "@/types/user"

export interface RegisterPayload {
  username: string
  password: string
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

export async function registerUser(payload: RegisterPayload) {
  const res = await apiClient.post("/auth/users/", payload, { includeAuth: false })
  return res
}

export async function loginAndStore(username: string, password: string) {
  const loginResp = await apiClient.post<{ access: string; refresh: string }>(
    "/auth/jwt/create/",
    { username, password },
    { includeAuth: false }
  )

  const { access, refresh } = loginResp.data
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)

  const userResp = await apiClient.get<ApiUser>("/auth/users/me/", { includeAuth: true })
  localStorage.setItem("user", JSON.stringify(userResp.data))

  return userResp.data
}

// Parse DRF-like errors to a single string for UI
export function parseApiError(err: any): string {
  if (!err) return "Lỗi không xác định"

  // If axios-like response
  const data = err?.response?.data || err?.data || err

  // If validation errors object {field: ["msg"]}
  if (typeof data === "object") {
    const parts: string[] = []
    for (const key of Object.keys(data)) {
      const val = (data as any)[key]
      if (Array.isArray(val)) {
        parts.push(`${key}: ${val.join(", ")}`)
      } else if (typeof val === "string") {
        parts.push(`${key}: ${val}`)
      }
    }
    if (parts.length) return parts.join("; ")
  }

  if (err?.message) return err.message
  return String(err)
}
