import { apiClient } from "./api-client"
import type { ApiUser } from "@/types/user"

export interface RegisterPayload {
  username: string
  password: string
  re_password?: string
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
  
  console.log('🔍 [loginAndStore] API Response:', userResp.data)
  console.log('🔍 [loginAndStore] User role:', userResp.data.role)
  
  localStorage.setItem("user", JSON.stringify(userResp.data))
  console.log('✅ [loginAndStore] Stored in localStorage:', JSON.parse(localStorage.getItem("user") || '{}'))

  return userResp.data
}

// Field name translations
const fieldTranslations: Record<string, string> = {
  username: "Tên đăng nhập",
  password: "Mật khẩu",
  re_password: "Nhập lại mật khẩu",
  email: "Email",
  first_name: "Họ",
  last_name: "Tên",
  phone_number: "Số điện thoại",
  detail: "",
  non_field_errors: "",
}

// Common error messages translation
const errorMessageTranslations: Record<string, string> = {
  "No active account found with the given credentials": "Tên đăng nhập hoặc mật khẩu không đúng",
  "Unable to log in with provided credentials.": "Không thể đăng nhập với thông tin đã cung cấp",
  "This field may not be blank.": "Trường này không được để trống",
  "This field is required.": "Trường này là bắt buộc",
  "Enter a valid email address.": "Vui lòng nhập địa chỉ email hợp lệ",
  "A user with that username already exists.": "Tên đăng nhập này đã tồn tại",
  "user with this email already exists.": "Email này đã được sử dụng",
  "The password is too similar to the email.": "Mật khẩu quá giống với địa chỉ email",
  "This password is too short. It must contain at least 8 characters.": "Mật khẩu quá ngắn. Phải có ít nhất 8 ký tự",
  "This password is too common.": "Mật khẩu này quá phổ biến",
  "This password is entirely numeric.": "Mật khẩu không được chỉ toàn số",
  "The two password fields didn't match.": "Hai trường mật khẩu không khớp",
}

// Helper function to translate a single error message
function translateErrorMessage(msg: string): string {
  // Check exact match first
  if (errorMessageTranslations[msg]) {
    return errorMessageTranslations[msg]
  }
  
  // Check partial matches for dynamic messages
  if (msg.includes("password") && msg.includes("similar")) {
    return "Mật khẩu quá giống với thông tin cá nhân của bạn"
  }
  if (msg.includes("at least") && msg.includes("character")) {
    return msg.replace(/at least (\d+) character/, "ít nhất $1 ký tự")
  }
  
  return msg
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
      const fieldName = fieldTranslations[key] || key
      
      if (Array.isArray(val)) {
        // Translate error messages
        const translatedMessages = val.map(msg => translateErrorMessage(msg))
        // If field has a name, show it; otherwise just show the message
        if (fieldName) {
          parts.push(`${fieldName}: ${translatedMessages.join(", ")}`)
        } else {
          parts.push(translatedMessages.join(", "))
        }
      } else if (typeof val === "string") {
        const translatedMsg = translateErrorMessage(val)
        if (fieldName) {
          parts.push(`${fieldName}: ${translatedMsg}`)
        } else {
          parts.push(translatedMsg)
        }
      }
    }
    if (parts.length) return parts.join("\n")
  }

  if (err?.message) return err.message
  return String(err)
}
