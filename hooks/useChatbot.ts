/**
 * React Hook for Chatbot
 * ======================
 * 
 * Custom hook for easy integration with React components.
 * Provides conversation state management and API interaction.
 */

'use client'

import { useState, useCallback } from 'react'
import ChatbotService, { type ChatMessage, type ChatResponse } from '@/lib/chatbot-service'

// ================= HOOK TYPES =================

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface UseChatbotResult {
  messages: Message[]
  isTyping: boolean
  error: string | null
  sendMessage: (text: string) => Promise<ChatResponse | null>
  clearMessages: () => void
  lastResponse: ChatResponse | null
}

// ================= CHATBOT HOOK =================

/**
 * Hook to manage chatbot conversation
 * Usage: const { messages, sendMessage, isTyping } = useChatbot()
 */
export function useChatbot(): UseChatbotResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)

  /**
   * Send a message to the chatbot
   */
  const sendMessage = useCallback(
    async (text: string): Promise<ChatResponse | null> => {
      if (!text.trim()) return null

      try {
        setError(null)

        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: text.trim(),
          sender: 'user',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setIsTyping(true)

        // Build conversation history - include the user message we just added
        const history = ChatbotService.buildHistory(
          [...messages, userMessage].map((msg) => ({
            sender: msg.sender,
            text: msg.text,
          }))
        )

        // Simulate typing delay (optional, can be removed for production)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Call API
        const response = await ChatbotService.sendMessage(text, history)

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          sender: 'bot',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
        setLastResponse(response)
        setIsTyping(false)

        return response
      } catch (err: any) {
        console.error('Send message error:', err)
        setError(err.message || 'Failed to send message')
        setIsTyping(false)

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Xin lỗi, mình không thể trả lời ngay bây giờ. Vui lòng thử lại sau! 😓',
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])

        return null
      }
    },
    [messages]
  )

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setLastResponse(null)
  }, [])

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    lastResponse,
  }
}

// ================= HEALTH CHECK HOOK =================

interface UseChatbotHealthResult {
  health: {
    status: 'healthy' | 'unhealthy'
    gemini_configured: boolean
    model: string
    frontend_url: string
  } | null
  loading: boolean
  error: string | null
  checkHealth: () => Promise<void>
}

/**
 * Hook to check chatbot health
 * Usage: const { health, loading, checkHealth } = useChatbotHealth()
 */
export function useChatbotHealth(): UseChatbotHealthResult {
  const [health, setHealth] = useState<UseChatbotHealthResult['health']>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await ChatbotService.checkHealth()
      setHealth(result)
    } catch (err: any) {
      console.error('Health check error:', err)
      setError(err.message || 'Health check failed')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    health,
    loading,
    error,
    checkHealth,
  }
}

// ================= EXAMPLE USAGE =================

/**
 * Example usage in component:
 * 
 * const MyChatComponent = () => {
 *   const { messages, sendMessage, isTyping, lastResponse } = useChatbot()
 * 
 *   const handleSend = async () => {
 *     const response = await sendMessage('Tìm phòng gần ĐHCT dưới 3 triệu')
 *     
 *     if (response && response.intent === 'find_room' && response.search_url) {
 *       // Redirect to search results
 *       window.location.href = response.search_url
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <div key={msg.id}>{msg.text}</div>
 *       ))}
 *       {isTyping && <div>Em Boo đang trả lời...</div>}
 *     </div>
 *   )
 * }
 */
