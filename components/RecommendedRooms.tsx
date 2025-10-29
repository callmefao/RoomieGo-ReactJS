"use client"

import { useEffect, useState, useRef } from "react"
import RoomCard from "./RoomCard"
import type { Room } from "@/types/room"
import { Button } from "@/components/ui/button"

// Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import RecommendedSwiperInner from "./RecommendedSwiperInner"

interface RecommendedRoomsProps {
  currentRoomId?: number
  title?: string
}

export default function RecommendedRooms({ currentRoomId, title }: RecommendedRoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        setError(null)
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        const res = await fetch(`${baseUrl}/api/rooms/?is_featured=True`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items: Room[] = data.results || data
  const filtered = (Array.isArray(items) ? items : []).filter((r) => r.id !== currentRoomId)
  setRooms(filtered)
      } catch (err) {
        console.error("RecommendedRooms fetch error:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [currentRoomId])

  const handleViewAll = () => {
    window.location.href = "/rental-listings"
  }

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title || "Các phòng nổi bật khác"}</h3>
          <p className="text-sm text-muted-foreground">Gợi ý những phòng tương tự và đáng chú ý.</p>
        </div>
        <div className="hidden sm:block">
          <Button size="sm" variant="ghost" onClick={handleViewAll}>Xem thêm</Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={false}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="recommended-rooms-swiper"
          >
            {[...Array(4)].map((_, i) => (
              <SwiperSlide key={i}>
                <div className="h-[18rem] rounded-xl bg-muted/40 animate-pulse" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500">Không thể tải gợi ý: {error}</div>
      ) : rooms.length === 0 ? (
        <div className="text-sm text-muted-foreground">Không tìm thấy phòng đề xuất.</div>
      ) : (
        <div className="relative mt-6">
          <RecommendedSwiperInner rooms={rooms} />
        </div>
      )}

      <style jsx global>{`
        .swiper-pagination-custom .swiper-pagination-bullet {
          background: #d1d5db; /* gray-300 */
          opacity: 1;
          width: 10px;
          height: 10px;
          margin: 0 6px;
          border-radius: 9999px;
          transition: transform 0.25s ease, background 0.25s ease, opacity 0.25s ease;
        }

        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #3b82f6, #22d3ee);
          transform: scale(1.2);
          box-shadow: 0 6px 18px -8px rgba(59,130,246,0.6);
        }

        /* fallback styling for container-specific bullets */
        .recommended-rooms-swiper .swiper-pagination-bullet { opacity: 0.9 }
      `}</style>
    </section>
  )
}
