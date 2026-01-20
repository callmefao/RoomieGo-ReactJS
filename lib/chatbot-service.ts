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

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message: string
  history?: ChatMessage[]
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
  intent: 'greeting' | 'find_room' | 'unclear' | 'error'
  reply: string
  search_url: string | null
  extracted_data: ExtractedData | null
}

export interface ChatbotHealth {
  status: 'healthy' | 'unhealthy'
  gemini_configured: boolean
  model: string
  frontend_url: string
}

// ================= CHATBOT SERVICE =================

export class ChatbotService {
  private static readonly MAX_HISTORY = 5 // Limit history for faster model response

  /**
   * Send a chat message to Em Boo
   * Matches: POST /api/chatbot/chat/
   */
  public static async sendMessage(
    message: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      // Limit history to last MAX_HISTORY messages
      const limitedHistory = history.slice(-this.MAX_HISTORY)

      const response = await apiClient.post<ChatResponse>(
        '/api/chatbot/chat/',
        {
          message: message.trim(),
          history: limitedHistory,
        },
        { 
          includeAuth: false, // Public endpoint
          timeout: 45000 // 45 seconds for AI processing
        }
      )

      return response.data
    } catch (error: any) {
      console.error('❌ Chatbot error:', error)
      
      // Return error response in case of failure
      return {
        intent: 'error',
        reply: 'Xin lỗi, mình gặp chút vấn đề kỹ thuật 😓\n\nVui lòng thử lại sau nhé!',
        search_url: null,
        extracted_data: null,
      }
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
   * Build conversation history from messages
   */
  public static buildHistory(
    messages: Array<{ sender: 'user' | 'bot'; text: string }>
  ): ChatMessage[] {
    return messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))
  }

  /**
   * Check if response has search results
   */
  public static hasSearchResults(response: ChatResponse): boolean {
    return response.intent === 'find_room' && response.search_url !== null
  }

  /**
   * Get welcome message
   */
  public static getWelcomeMessage(): string {
    return 'Chào bạn! Mình là Em Boo, chú chim cánh cụt đáng yêu của Tro4S! 🐧\n\nMình ở đây để giúp bạn tìm phòng trọ tại Cần Thơ một cách dễ dàng nhất! Bạn chỉ cần cho mình biết:\n- Bạn muốn tìm phòng ở đâu? (ví dụ: gần Đại học Cần Thơ, quận Ninh Kiều...)\n- Giá phòng mong muốn? (ví dụ: dưới 3 triệu, từ 2-4 triệu...)\n- Có tiện nghi gì không? (ví dụ: có wifi, có điều hòa...)\n\nHãy hỏi mình bất cứ điều gì nhé! 💙'
  }
}

// Export singleton instance for convenience
export const chatbotService = ChatbotService

// Export default
export default ChatbotService
