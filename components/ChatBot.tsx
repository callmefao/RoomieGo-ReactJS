"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const BOT_RESPONSES = {
  greeting: [
    "Chào bạn! Mình là Em Boo nè 🎀 Bạn đang tìm phòng trọ ở đâu thế?",
    "Hi bạn yêu! Em Boo đây 💙 Để em giúp bạn tìm phòng trọ ưng ý nhé!",
    "Xin chào! Em là Boo, trợ lý tìm trọ của bạn 🏠 Em có thể giúp gì cho bạn?",
  ],
  budget: [
    "Bạn muốn tìm phòng trong tầm giá bao nhiêu vậy? Em sẽ lọc phòng phù hợp cho bạn ngay! 💰",
    "Ngân sách của bạn khoảng bao nhiêu một tháng nhỉ? Để em tìm những phòng đẹp mà giá hợp lý nha! ✨",
  ],
  location: [
    "Bạn muốn tìm phòng ở khu vực nào? Gần trường học, gần chợ hay trung tâm thành phố? 📍",
    "Địa điểm nào bạn thích nhất? Em sẽ tìm những phòng đẹp ở gần đó cho bạn! 🗺️",
  ],
  amenities: [
    "Bạn cần phòng có những tiện ích gì nhỉ? Wifi, máy lạnh, bếp riêng...? Cứ nói em nghe nha! 🌟",
    "Phòng bạn tìm cần có gì đặc biệt không? Gác lửng, ban công, hay máy giặt? Em note lại liền! 📝",
  ],
  confirmation: [
    "Để em tìm phòng phù hợp với yêu cầu của bạn nhé! Chờ em một chút... 🔍",
    "Okee! Em đang tìm kiếm những phòng đẹp nhất cho bạn đây! ⏳",
  ],
  help: [
    "Em có thể giúp bạn:\n• Tìm phòng theo giá 💰\n• Lọc phòng theo khu vực 📍\n• Gợi ý phòng có tiện ích mong muốn ✨\n• Xem phòng nổi bật 🌟\nBạn muốn làm gì nhỉ?",
    "Em Boo có thể:\n✨ Tìm phòng giá rẻ\n🏠 Gợi ý phòng gần trường\n💎 Lọc phòng cao cấp\n🎯 Tìm phòng theo yêu cầu\nBạn cần gì nào?",
  ],
  thanks: [
    "Không có gì đâu bạn yêu! Em luôn sẵn sàng giúp bạn mà 💙",
    "Hehe, em vui khi giúp được bạn! Có gì cứ gọi em nha! 🎀",
  ],
  default: [
    "Hmm... Em chưa hiểu lắm ý bạn 🤔 Bạn có thể nói rõ hơn được không?",
    "Em không chắc mình hiểu đúng ý bạn 😅 Bạn thử nói lại xem?",
    "Xin lỗi bạn, em chưa được học câu này 🥺 Bạn có thể hỏi em về tìm phòng trọ không?",
  ],
}

const QUICK_REPLIES = [
  { text: "Tìm phòng giá rẻ", icon: "💰" },
  { text: "Phòng gần trường", icon: "🎓" },
  { text: "Phòng có gác lửng", icon: "🏠" },
  { text: "Xem phòng nổi bật", icon: "⭐" },
]

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        text: BOT_RESPONSES.greeting[Math.floor(Math.random() * BOT_RESPONSES.greeting.length)],
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, isTyping])

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Greeting detection
    if (
      lowerMessage.match(/^(hi|hello|chào|xin chào|hey|hế nhô|hê lô|helo)/i) ||
      lowerMessage.match(/(bạn ơi|em ơi|có ai|có người)/i)
    ) {
      return BOT_RESPONSES.greeting[Math.floor(Math.random() * BOT_RESPONSES.greeting.length)]
    }

    // Budget related
    if (lowerMessage.match(/(giá|tiền|bao nhiêu|tầm|triệu|ngàn|budget|rẻ|mắc)/i)) {
      return BOT_RESPONSES.budget[Math.floor(Math.random() * BOT_RESPONSES.budget.length)]
    }

    // Location related
    if (
      lowerMessage.match(/(đâu|chỗ nào|khu vực|địa điểm|quận|phường|gần|xa|trường|chợ|trung tâm)/i)
    ) {
      return BOT_RESPONSES.location[Math.floor(Math.random() * BOT_RESPONSES.location.length)]
    }

    // Amenities related
    if (
      lowerMessage.match(
        /(tiện ích|wifi|máy lạnh|điều hòa|bếp|giặt|gác lửng|ban công|thang máy|bãi xe|nóng lạnh)/i
      )
    ) {
      return BOT_RESPONSES.amenities[Math.floor(Math.random() * BOT_RESPONSES.amenities.length)]
    }

    // Help request
    if (lowerMessage.match(/(giúp|help|hỗ trợ|làm sao|thế nào|có thể|được gì)/i)) {
      return BOT_RESPONSES.help[Math.floor(Math.random() * BOT_RESPONSES.help.length)]
    }

    // Thanks
    if (lowerMessage.match(/(cảm ơn|thank|cám ơn|thanks|tks|ty)/i)) {
      return BOT_RESPONSES.thanks[Math.floor(Math.random() * BOT_RESPONSES.thanks.length)]
    }

    // Quick action keywords
    if (lowerMessage.match(/(tìm|tìm kiếm|search|lọc|filter|gợi ý|suggest)/i)) {
      return BOT_RESPONSES.confirmation[Math.floor(Math.random() * BOT_RESPONSES.confirmation.length)]
    }

    // Default response
    return BOT_RESPONSES.default[Math.floor(Math.random() * BOT_RESPONSES.default.length)]
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 800 + Math.random() * 800) // Random delay 0.8-1.6s
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
        "fixed z-50 flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl shadow-2xl border-2 border-cyan-200/50 transition-all duration-300",
        isMinimized
          ? "bottom-6 right-6 w-80 h-20"
          : "bottom-6 right-6 w-[420px] h-[600px] md:w-[450px] md:h-[650px]"
      )}
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
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
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
                      "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                      message.sender === "user"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                        : "bg-white border border-cyan-100 text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    <span
                      className={cn(
                        "text-[10px] mt-1 block",
                        message.sender === "user" ? "text-cyan-100" : "text-muted-foreground"
                      )}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

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
