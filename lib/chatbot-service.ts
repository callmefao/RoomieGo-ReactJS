/**
 * Chatbot Service - API calls for Em Boo chatbot
 * ============================================
 * 
 * This service handles all chatbot-related API operations:
 * - Sending messages and receiving responses
 * - Managing conversation history
 * - Health check monitoring
 * 
 * Clean separation from ApiClient for better maintainability
 */

import { apiClient } from './api-client'

// ================= TYPES =================

export interface ChatRequest {
  message: string
  conversation_id?: string | null
}

export interface Room {
  id: string
  title: string
  price: number
  electricity_price: number | null
  water_price: number | null
  location: string
  district: string | null
  area: number
  amenities: string[]
  has_mezzanine: boolean
  image_360_url: string | null
  main_image_url: string | null
  distance_km?: number
}

export interface FunctionResult {
  function_name: 'search_rooms' | 'get_room_details' | 'recommend_similar_rooms'
  data: {
    success: boolean
    rooms?: Room[]
    room?: Room
    similar_rooms?: Room[]
    count?: number
    total_available?: number
    search_params?: any
    [key: string]: any
  }
}

export interface ExtractedData {
  location?: string
  price_min?: number
  price_max?: number
  amenities?: number[]
  coordinates?: {
    lat: number
    lng: number
    radius: number
  }
}

export interface ChatResponse {
  conversation_id: string
  intent: 
    | 'greeting'
    | 'agent_search'
    | 'agent_details'
    | 'agent_recommend'
    | 'quality_assurance'
    | 'unclear'
    | 'error'
    | 'rate_limited'
    | 'budget_exceeded'
    | 'timeout'
  reply: string
  search_url: string | null
  extracted_data: ExtractedData | null
  function_results?: FunctionResult[]  // NEW: Structured data
}

export interface ChatbotHealth {
  status: 'ok' | 'error'
  message: string
  chatbot_name: string
  version: string
  features: string[]
  database: {
    connected: boolean
    conversationCount: number
    messageCount: number
  }
  config: {
    llmModel: string
    apiKeyConfigured: boolean
    maxHistoryMessages: number
    timeoutSeconds: number
    supportedIntents: string[]
  }
  rateLimits: {
    anonymous: string
    authenticated: string
    burst: string
  }
  budget: {
    dailyLimit: number
    dailyTokenLimit: number
    todayUsage: {
      requests: number
      tokens: number
      cost: number
    }
    remainingBudget: number
    remainingTokens: number
  }
}

// ================= CHATBOT SERVICE =================

export class ChatbotService {
  /**
   * Send a chat message to Em Boo
   * Matches: POST /api/chatbot/chat/
   * 
   * Supports both anonymous and authenticated users.
   * Authentication is optional - if token exists, it will be included.
   */
  public static async sendMessage(
    message: string,
    conversationId?: string | null
  ): Promise<ChatResponse> {
    try {
      const payload: ChatRequest = {
        message: message.trim(),
      }

      // Include conversation_id if continuing a conversation
      if (conversationId) {
        payload.conversation_id = conversationId
      }

      // Try to include auth if available (optional for chatbot)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

      const response = await apiClient.post<ChatResponse>(
        '/api/chatbot/chat/',
        payload,
        { 
          includeAuth: !!token, // Include auth if token exists
          timeout: 45000 // 45 seconds for AI processing
        }
      )

      return response.data
    } catch (error: any) {
      console.error('❌ Chatbot error:', error)

      const status = error.response?.status
      const data = error.response?.data

      // Handle specific HTTP errors
      if (status === 403) {
        // Conversation không tồn tại hoặc không có quyền
        throw { 
          status: 403, 
          message: 'conversation_unauthorized',
          data 
        }
      }

      if (status === 429) {
        // Rate limit
        return {
          conversation_id: conversationId || '',
          intent: 'rate_limited',
          reply: data?.reply || 'Vui lòng chờ một chút trước khi gửi tin nhắn khác 🕐',
          search_url: null,
          extracted_data: null,
        }
      }

      if (status === 503) {
        // Budget exceeded
        return {
          conversation_id: conversationId || '',
          intent: 'budget_exceeded',
          reply: data?.reply || 'Em Boo đang nghỉ ngơi, thử lại sau nhé 💤',
          search_url: null,
          extracted_data: null,
        }
      }
      
      // Return generic error response
      throw error
    }
  }

  /**
   * Check chatbot health status
   * Matches: GET /api/chatbot/health/
   */
  public static async checkHealth(): Promise<ChatbotHealth | null> {
    try {
      const response = await apiClient.get<ChatbotHealth>(
        '/api/chatbot/health/',
        { includeAuth: false }
      )

      console.log('✅ Chatbot health check:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Health check failed:', error)
      return null
    }
  }

  /**
   * Format price for display
   */
  public static formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price)
  }

  /**
   * Get amenity name by ID
   */
  public static getAmenityName(amenityId: number): string {
    const amenityMap: Record<number, string> = {
      1: 'Điều hòa',
      2: 'Wifi',
      3: 'Bãi đậu xe',
      4: 'Chỗ phơi đồ',
    }
    return amenityMap[amenityId] || `Tiện ích #${amenityId}`
  }

  /**
   * Parse search URL to extract query parameters
   */
  public static parseSearchUrl(searchUrl: string): URLSearchParams | null {
    try {
      const url = new URL(searchUrl)
      return url.searchParams
    } catch (error) {
      console.error('Failed to parse search URL:', error)
      return null
    }
  }



  /**
   * Check if response has search results
   */
  public static hasSearchResults(response: ChatResponse): boolean {
    return response.intent === 'agent_search' && response.search_url !== null
  }

  /**
   * Get intent icon for display
   */
  public static getIntentIcon(intent: ChatResponse['intent']): string {
    const iconMap: Record<ChatResponse['intent'], string> = {
      greeting: '👋',
      agent_search: '🔍',
      agent_details: '🏡',
      agent_recommend: '✨',
      quality_assurance: '🛡️',
      unclear: '❓',
      error: '⚠️',
      rate_limited: '🕐',
      budget_exceeded: '💤',
      timeout: '⏱️',
    }
    return iconMap[intent] || '🐧'
  }

  /**
   * Get intent color for display
   */
  public static getIntentColor(intent: ChatResponse['intent']): string {
    const colorMap: Record<ChatResponse['intent'], string> = {
      greeting: 'cyan',
      agent_search: 'blue',
      agent_details: 'green',
      agent_recommend: 'purple',
      quality_assurance: 'teal',
      unclear: 'gray',
      error: 'red',
      rate_limited: 'orange',
      budget_exceeded: 'yellow',
      timeout: 'amber',
    }
    return colorMap[intent] || 'gray'
  }

  /**
   * Get welcome message
   */
  public static getWelcomeMessage(): string {
    return 'Chào bạn! Mình là Em Boo, chú chim cánh cụt đáng yêu của Tro4S! 🐧\n\nMình ở đây để giúp bạn tìm phòng trọ tại Cần Thơ một cách dễ dàng nhất! Bạn chỉ cần cho mình biết:\n- Bạn muốn tìm phòng ở đâu? (ví dụ: gần Đại học Cần Thơ, quận Ninh Kiều...)\n- Giá phòng mong muốn? (ví dụ: dưới 3 triệu, từ 2-4 triệu...)\n- Có tiện nghi gì không? (ví dụ: có wifi, có điều hòa...)\n\nHãy hỏi mình bất cứ điều gì nhé! 💙'
  }

  /**
   * Check if user is authenticated
   */
  public static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('access_token')
    return !!token
  }

  /**
   * Get authentication status for display
   */
  public static getAuthStatus(): { 
    isAuthenticated: boolean
    rateLimit: string 
  } {
    const isAuth = this.isAuthenticated()
    return {
      isAuthenticated: isAuth,
      rateLimit: isAuth ? '30/phút' : '10/phút'
    }
  }
}

// Export singleton instance for convenience
export const chatbotService = ChatbotService

// Export default
export default ChatbotService
