"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import RoomCard from "./RoomCard"
import type { Room } from "@/types/room"

export default function SuggestedRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch featured rooms với is_featured=True
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const response = await fetch(`${baseUrl}/api/rooms/?is_featured=True`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        // Check if response has results array (DRF pagination) or is direct array
        const roomsData = data.results || data
        setRooms(Array.isArray(roomsData) ? roomsData : [])
        
        console.log('✅ Featured rooms loaded:', roomsData?.length || 0)
        console.log('📝 Response structure:', { hasResults: !!data.results, isArray: Array.isArray(data) })
      } catch (error) {
        console.error("❌ Error fetching featured rooms:", error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedRooms()
  }, [])

  const handleViewMore = () => {
    router.push("/rental-listings")
  }

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Đề xuất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-muted animate-pulse rounded-lg h-80"></div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Đề xuất</h2>
        <div className="text-center">
          <p className="text-red-500 mb-4">Không thể tải phòng đề xuất: {error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
        Phòng nổi bật {rooms.length > 0 && `(${rooms.length})`}
      </h2>

      {rooms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Hiện chưa có phòng nổi bật nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {rooms.slice(0, 6).map((room) => (  
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="text-center">
              <Button
                onClick={handleViewMore}
                size="lg"
                className="group relative px-16 py-6 font-bold text-xl rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Xem tất cả phòng
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
          </div>
        </>
      )}
    </section>
  )
}
