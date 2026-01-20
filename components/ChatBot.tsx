"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Mic, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatbot } from "@/hooks/useChatbot"
import ChatbotService from "@/lib/chatbot-service"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

// Quick reply suggestions for users
const QUICK_REPLIES = [
  { text: "Tìm phòng giá rẻ", icon: "💰" },
  { text: "Phòng gần ĐHCT", icon: "🎓" },
  { text: "Phòng có wifi", icon: "📶" },
  { text: "Dưới 3 triệu", icon: "💵" },
]

export default function ChatBot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use chatbot hook for API integration
  const { messages, isTyping, sendMessage: sendApiMessage, lastResponse } = useChatbot()

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        text: ChatbotService.getWelcomeMessage(),
        sender: "bot",
        timestamp: new Date(),
      }
      // Manually add welcome message to hook state would require modification
      // For now, we'll trigger it through the UI
    }
  }, [isOpen, messages.length])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        // Smooth scroll to bottom
        setTimeout(() => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    setInputValue("")

    // Call API through hook
    const response = await sendApiMessage(text)

    // Handle search results
    if (response && ChatbotService.hasSearchResults(response)) {
      // Optional: Show a notification before redirecting
      setTimeout(() => {
        if (response.search_url) {
          router.push(response.search_url.replace('http://localhost:3000', ''))
        }
      }, 1500) // Delay 1.5s to let user read the response
    }
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
        {/* Outer gradient ring with animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 animate-spin-slow blur-sm opacity-75 group-hover:opacity-100 transition-opacity" style={{ padding: '4px' }}></div>
        
        {/* Inner button with logo */}
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 p-1 shadow-2xl group-hover:shadow-cyan-400/50 group-hover:scale-110 transition-all duration-300">
          <div className="relative h-full w-full rounded-full bg-white p-2 overflow-hidden">
            <Image src="/images/RoomieGo-logo.png" alt="Chat với Em Boo" fill className="object-cover rounded-full" />
          </div>
        </div>
        
        {/* Ping animation effect */}
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </span>
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
          <div className={cn(
            "relative flex-shrink-0",
            isMinimized ? "h-12 w-12" : "h-12 w-12"
          )}>
            <Image src="/images/MASCOT.png" alt="Em Boo" fill className="object-contain" />
          </div>
          {!isMinimized && (
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Em Boo
              </h3>
              <span className="text-xs text-cyan-100">✨ Trợ lý tìm trọ</span>
            </div>
          )}
          {isMinimized && (
            <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Em Boo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 pt-3 pb-2 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => {
                // Check if this is the last bot message with search URL
                const isLastBotMessage = message.sender === "bot" && index === messages.length - 1;
                const hasSearchUrl = isLastBotMessage && lastResponse?.search_url;

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
                        <Image
                          src="/images/MASCOT.png"
                          alt="Em Boo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl shadow-sm",
                        message.sender === "user"
                          ? "max-w-[75%] bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-4 py-2"
                          : "max-w-[85%] sm:max-w-[380px] bg-white border border-cyan-100 text-foreground"
                      )}
                    >
                      <div className={message.sender === "bot" ? "px-4 py-2" : ""}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">{message.text}</p>
                        <span
                          className={cn(
                            "text-[10px] mt-1 block",
                            message.sender === "user" ? "text-cyan-100" : "text-muted-foreground"
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      
                      {/* Show search button inside bot message bubble */}
                      {hasSearchUrl && (
                        <div className="px-3 pb-3 pt-2 border-t border-cyan-100 mt-2">
                          <Button
                            size="sm"
                            onClick={() => router.push(lastResponse.search_url!.replace('http://localhost:3000', ''))}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Xem kết quả tìm kiếm
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

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
                className="rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse cursor-pointer"
                title="Nói chuyện với Boo"
              >
                <Mic className="h-5 w-5 text-white" />
              </Button>
              <Input
                ref={inputRef}
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
