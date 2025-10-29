/**
 * API Client for Roomie Go Backend Communication
 * =========================================
 * 
 * This client handles all HTTP requests to the Django backend API.
 * Features:
 * - JWT Token management (auto-include in headers)
 * - Request/Response interceptors
 * - Error handling
 * - TypeScript support
 * - Clean separation of concerns
 */

// Types for API client
export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

export interface ApiError {
  message: string
  status: number
  details?: any
}

export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    // Backend Django API base URL (port 8000)
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Get stored JWT token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  /**
   * Set JWT token in localStorage
   */
  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  /**
   * Remove JWT token from localStorage
   */
  public removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  /**
   * Build headers for request (with or without auth)
   */
  private buildHeaders(includeAuth: boolean = true, customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders }

    // Add custom headers
    if (customHeaders) {
      Object.assign(headers, customHeaders)
    }

    // Add authorization header if requested and token exists
    if (includeAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, this.baseURL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
    }

    console.log(`🌐 API URL built: ${url.toString()}`)
    return url.toString()
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    let data: T
    if (isJson) {
      data = await response.json()
    } else {
      data = await response.text() as unknown as T
    }

    if (!response.ok) {
      const error: ApiError = {
        message: isJson ? (data as any).detail || (data as any).message || 'An error occurred' : 'An error occurred',
        status: response.status,
        details: data
      }
      throw error
    }

    return {
      data,
      status: response.status
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: {
      data?: any
      params?: Record<string, any>
      headers?: Record<string, string>
      includeAuth?: boolean
      timeout?: number
    }
  ): Promise<ApiResponse<T>> {
    const {
      data,
      params,
      headers: customHeaders,
      includeAuth = true,
      timeout = 10000
    } = options || {}

    const url = this.buildURL(endpoint, params)
    const headers = this.buildHeaders(includeAuth, customHeaders)

    const config: RequestInit = {
      method,
      headers,
    }

    // Attach body for non-GET requests when payload is provided
    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // For file uploads, remove Content-Type header to let browser set it
        delete headers['Content-Type']
        config.body = data
      } else {
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json'
        }
        config.body = JSON.stringify(data)
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      config.signal = controller.signal

      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      return await this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
      if (error && typeof error === 'object' && 'status' in error) {
        throw error as ApiError
      }
      throw new Error('Network error')
    }
  }

  // ================= PUBLIC METHODS =================

  /**
   * GET request
   */
  public async get<T>(endpoint: string, config?: RequestConfig & { includeAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, config)
  }

  /**
   * POST request
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig & { includeAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...config, data })
  }

  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig & { includeAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...config, data })
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig & { includeAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...config, data })
  }

  /**
   * DELETE request
   */
  public async delete<T>(
    endpoint: string,
    config?: RequestConfig & { includeAuth?: boolean; data?: any }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, config)
  }

  // ================= AUTHENTICATION HELPERS =================

  /**
   * Login and store tokens
   */
  public async login(credentials: { username: string; password: string }): Promise<{ access: string; refresh: string }> {
    const response = await this.post<{ access: string; refresh: string }>(
      '/auth/jwt/create/',
      credentials,
      { includeAuth: false }
    )
    
    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
    }
    
    return response.data
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<{ access: string }> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.post<{ access: string }>(
      '/auth/jwt/refresh/',
      { refresh: refreshToken },
      { includeAuth: false }
    )
    
    // Update access token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access)
    }
    
    return response.data
  }

  /**
   * Logout and clear tokens
   */
  public logout(): void {
    this.removeAuthToken()
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing or multiple instances
export default ApiClient