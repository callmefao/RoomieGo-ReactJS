/**
 * React Hook for Chatbot
 * ======================
 * 
 * Custom hook for easy integration with React components.
 * Provides conversation state management and API interaction.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import ChatbotService, { type ChatResponse, type FunctionResult } from '@/lib/chatbot-service'

// ================= HOOK TYPES =================

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  intent?: string
  function_results?: FunctionResult[]  // NEW: Structured data
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
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Restore conversation_id from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConvId = localStorage.getItem('chatbot_conversation_id')
      if (savedConvId) {
        setConversationId(savedConvId)
      }
    }
  }, [])

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

        // Simulate typing delay (optional)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Call API with conversation_id
        const response = await ChatbotService.sendMessage(text, conversationId)

        // Save conversation_id for subsequent messages
        if (response.conversation_id) {
          setConversationId(response.conversation_id)
          if (typeof window !== 'undefined') {
            localStorage.setItem('chatbot_conversation_id', response.conversation_id)
          }
        }

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          sender: 'bot',
          timestamp: new Date(),
          intent: response.intent,
          function_results: response.function_results,  // NEW: Include structured data
        }

        setMessages((prev) => [...prev, botMessage])
        setLastResponse(response)
        setIsTyping(false)

        return response
      } catch (err: any) {
        console.error('Send message error:', err)
        setIsTyping(false)

        // Handle 403 - Conversation unauthorized (anonymous user with different IP)
        if (err.status === 403 || err.response?.status === 403) {
          console.warn('Conversation unauthorized, starting new conversation')
          setConversationId(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('chatbot_conversation_id')
          }
          
          // Show friendly error message
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Cuộc trò chuyện đã hết phiên. Hãy bắt đầu lại nhé! 😊',
            sender: 'bot',
            timestamp: new Date(),
            intent: 'error',
          }
          setMessages((prev) => [...prev, errorMessage])
          
          // Don't retry automatically for 403
          return null
        }

        // Handle 429 - Rate limit (should be handled by service, but double-check)
        if (err.status === 429 || err.response?.status === 429) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi một chút! 🕐',
            sender: 'bot',
            timestamp: new Date(),
            intent: 'rate_limited',
          }
          setMessages((prev) => [...prev, errorMessage])
          return null
        }

        setError(err.message || 'Failed to send message')

        // Add generic error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Xin lỗi, mình không thể trả lời ngay bây giờ. Vui lòng thử lại sau! 😓',
          sender: 'bot',
          timestamp: new Date(),
          intent: 'error',
        }
        setMessages((prev) => [...prev, errorMessage])

        return null
      }
    },
    [conversationId]
  )

  /**
   * Clear all messages and conversation
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setLastResponse(null)
    setConversationId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatbot_conversation_id')
    }
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
