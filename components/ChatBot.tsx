"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatbot } from "@/hooks/useChatbot"
import ChatbotService from "@/lib/chatbot-service"
import { RoomCard } from "@/components/chatbot/RoomCard"
import { RoomDetailsCard } from "@/components/chatbot/RoomDetailsCard"
import { getRooms, getRoomDetails, hasRoomData } from "@/lib/utils/chatbot-helpers"

// Quick reply suggestions
const QUICK_REPLIES = [
  { text: "Tìm phòng giá rẻ", icon: "💰" },
  { text: "Phòng gần ĐHCT", icon: "🎓" },
  { text: "Phòng có wifi", icon: "📶" },
  { text: "Dưới 3 triệu", icon: "💵" },
]

/**
 * Format bot message text with proper line breaks
 */
function formatBotMessage(text: string): string {
  return text
    // Add line break before each room entry (emoji patterns)
    .replace(/([^\n])\s*(🏠|🏡|🏘️)\s*Phòng/g, '$1\n\n$2 Phòng')
    // Add line break before key info sections
    .replace(/([^\n|])\s*(💰|📍|📏|🏠|✨)\s*(?!Phòng)/g, '$1\n$2 ')
    // Keep utility prices on same line (after |)
    .replace(/\|\s*\n/g, ' | ')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function ChatBot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [authStatus, setAuthStatus] = useState<{ isAuthenticated: boolean; rateLimit: string }>({
    isAuthenticated: false,
    rateLimit: "10/phút"
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, isTyping, sendMessage: sendApiMessage, lastResponse } = useChatbot()

  // Check auth status  
  useEffect(() => {
    if (isOpen) {
      const status = ChatbotService.getAuthStatus()
      setAuthStatus(status)
    }
  }, [isOpen])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    setInputValue("")
    await sendApiMessage(text)
  }

  const handleNavigate = (url: string) => {
    router.push(url)
  }

  const handleFindSimilar = (roomId: string) => {
    sendMessage(`Tìm phòng tương tự phòng ${roomId}`)
  }

  const handleQuickReply = (text: string) => {
    sendMessage(text)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group cursor-pointer"
      >
        <div className="relative">
          {/* Subtle animated glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse transition-opacity" />
          
          {/* Subtle ring animation */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-40 group-hover:opacity-60 animate-pulse [animation-duration:2s] [animation-delay:0.5s]" />
          
          {/* Main button */}
          <div className="relative bg-gradient-to-br from-cyan-500 to-blue-500 p-1 rounded-full shadow-xl hover:shadow-2xl transition-all group-hover:scale-105">
            <div className="bg-white rounded-full p-2">
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                <Image 
                  src="/images/MASCOT.png" 
                  alt="Em Boo" 
                  fill 
                  className="object-contain scale-110"
                />
              </div>
            </div>
          </div>

          {/* Status indicator with ping */}
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-400 border-2 border-white shadow-sm" />
          </span>
        </div>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl shadow-2xl border-2 border-cyan-200/50 transition-all duration-300 overflow-hidden",
        isMinimized
          ? "bottom-6 right-6 w-80 h-20"
          : "bottom-6 right-6 w-[420px] md:w-[450px]"
      )}
      style={!isMinimized ? { height: 'min(650px, calc(100vh - 100px))' } : undefined}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 border-b-2 border-cyan-300/50 shadow-lg transition-all",
        isMinimized ? "rounded-3xl" : "rounded-t-3xl"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image src="/images/MASCOT.png" alt="Em Boo" fill className="object-contain" />
          </div>
          {!isMinimized && (
            <div>
              <h3 className="font-bold text-white text-lg">EM BOO</h3>
              <p className="text-xs text-cyan-100 flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                Trợ lý tìm trọ 🐧 ({authStatus.rateLimit})
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 pt-3 pb-2 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => {
                const intentIcon = message.intent ? ChatbotService.getIntentIcon(message.intent as any) : null

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      message.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === "bot" && (
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image src="/images/MASCOT.png" alt="Em Boo" fill className="object-contain" />
                      </div>
                    )}

                    {/* User Message */}
                    {message.sender === "user" && (
                      <div className="max-w-[75%] bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-2xl shadow-sm">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{message.text}</p>
                        <span className="text-[10px] mt-1 block text-cyan-100">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}

                    {/* Bot Message */}
                    {message.sender === "bot" && (() => {
                      // Check for structured data
                      if (message.function_results) {
                        const rooms = getRooms({ function_results: message.function_results } as any)
                        const roomDetails = getRoomDetails({ function_results: message.function_results } as any)

                        // Render room search results
                        if (rooms.length > 0) {
                          return (
                            <div className="max-w-[95%] sm:max-w-[450px] space-y-3">
                              {/* Intro text */}
                              {message.text && (
                                <div className="bg-white border border-cyan-100 rounded-2xl px-4 py-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{intentIcon || '🔍'}</span>
                                    <span className="text-xs text-muted-foreground">Kết quả tìm kiếm</span>
                                  </div>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{formatBotMessage(message.text)}</p>
                                  <span className="text-[10px] mt-2 block text-muted-foreground">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                              )}

                              {/* Room cards */}
                              <div className="space-y-3">
                                {rooms.map((room, index) => (
                                  <RoomCard
                                    key={room.id}
                                    room={room}
                                    number={index + 1}
                                    onViewDetails={handleNavigate}
                                    compact={rooms.length > 3}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        }

                        // Render room details
                        if (roomDetails) {
                          return (
                            <div className="max-w-[95%] sm:max-w-[450px] space-y-3">
                              {/* Intro text */}
                              {message.text && (
                                <div className="bg-white border border-cyan-100 rounded-2xl px-4 py-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{intentIcon || '📋'}</span>
                                    <span className="text-xs text-muted-foreground">Chi tiết phòng</span>
                                  </div>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{formatBotMessage(message.text)}</p>
                                  <span className="text-[10px] mt-2 block text-muted-foreground">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                              )}

                              {/* Room details card */}
                              <RoomDetailsCard
                                room={roomDetails}
                                onViewFullPage={handleNavigate}
                                onViewImages={handleNavigate}
                                onFindSimilar={handleFindSimilar}
                              />
                            </div>
                          )
                        }
                      }

                      // Default plain text message
                      return (
                        <div className="max-w-[85%] sm:max-w-[380px] bg-white border border-cyan-100 rounded-2xl px-4 py-2 shadow-sm">
                          {intentIcon && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{intentIcon}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {message.intent?.replace('agent_', '').replace('_', ' ')}
                              </span>
                            </div>
                          )}
                          <p className={cn(
                            "text-sm whitespace-pre-wrap leading-relaxed break-words",
                            message.intent === 'quality_assurance' && "font-medium",
                            message.intent === 'error' && "text-red-600"
                          )}>
                            {formatBotMessage(message.text)}
                          </p>
                          <span className="text-[10px] mt-1 block text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative h-8 w-8 flex-shrink-0">
                    <Image src="/images/MASCOT.png" alt="Em Boo" fill className="object-contain" />
                  </div>
                  <div className="bg-white border border-cyan-100 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply(reply.text)}
                    className="text-xs bg-white hover:bg-cyan-50 border-cyan-200 hover:border-cyan-300 rounded-full shadow-sm cursor-pointer"
                  >
                    <span className="mr-1">{reply.icon}</span>
                    {reply.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-sm border-t border-cyan-200/50">
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                className="rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 cursor-pointer"
                title="Nói chuyện với Boo"
              >
                <Mic className="h-5 w-5 text-white" />
              </Button>
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhắn tin cho Em Boo..."
                className="flex-1 rounded-full border-2 border-cyan-200 focus:border-cyan-400 bg-white shadow-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
