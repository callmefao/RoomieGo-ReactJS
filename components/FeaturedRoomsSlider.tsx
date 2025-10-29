"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import RoomCard from "./RoomCard"
import type { Room } from "@/types/room"
import { Sparkles } from "lucide-react"

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function FeaturedRoomsSlider() {
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

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <section className="relative w-full py-16">
      <div className="absolute inset-x-0 top-8 -z-10 mx-auto h-72 w-full max-w-none rounded-full bg-blue-100/40 blur-3xl" aria-hidden />
      <div className="relative w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_35px_120px_-60px_rgba(14,165,233,0.8)] backdrop-blur-xl sm:p-10 md:overflow-visible">
        <div className="pointer-events-none absolute -left-28 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-blue-100 via-cyan-100 to-transparent blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-gradient-to-r from-cyan-100 via-blue-100 to-transparent blur-2xl" aria-hidden />
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1 text-sm font-semibold text-blue-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Tuyển chọn đặc biệt
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Phòng nổi bật {rooms.length > 0 && `(${rooms.length})`}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Những căn phòng đáng giá nhất tuần này, được chọn lọc kỹ lưỡng về vị trí, tiện nghi và mức giá hấp dẫn cho sinh viên và người đi làm.
            </p>
          </div>
          {children}
        </div>
      </div>
    </section>
  )

  if (loading) {
    return (
      <Wrapper>
        <div className="mt-12">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{ 
              clickable: true,
              el: '.swiper-pagination-custom'
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="featured-rooms-swiper"
          >
            {[...Array(6)].map((_, index) => (
              <SwiperSlide key={index}>
                <div className="h-[20rem] rounded-3xl bg-gradient-to-br from-slate-100 via-slate-50 to-white/80 p-6">
                  <div className="h-full w-full rounded-2xl border border-dashed border-slate-200 bg-slate-100/70 animate-pulse" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Wrapper>
    )
  }

  if (error) {
    return (
      <Wrapper>
        <div className="mt-12 text-center">
          <p className="text-red-500 mb-4 text-lg font-semibold">Không thể tải phòng nổi bật: {error}</p>
          <Button onClick={() => window.location.reload()} variant="default" size="lg">
            Thử lại
          </Button>
        </div>
      </Wrapper>
    )
  }

  if (rooms.length === 0) {
    return (
      <Wrapper>
        <div className="mt-12 text-center text-muted-foreground text-lg">
          Hiện chưa có phòng nổi bật nào. Hãy quay lại sau để khám phá những lựa chọn mới nhất nhé!
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div className="relative mt-12">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ 
            clickable: true,
            el: '.swiper-pagination-custom'
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={false}
          watchSlidesProgress={true}
          observer={true}
          observeParents={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="featured-rooms-swiper mb-8"
        >
          {rooms.map((room) => (
            <SwiperSlide key={`room-${room.id}`}>
              <RoomCard room={room} highlighted />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-1.5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-3 text-blue-600 shadow-[0_20px_45px_-28px_rgba(37,99,235,0.8)] ring-1 ring-blue-100/70 backdrop-blur transition-all duration-300 hover:-translate-y-1/2 hover:scale-115 hover:bg-white hover:shadow-[0_28px_70px_-32px_rgba(37,99,235,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:shadow-[0_24px_65px_-30px_rgba(37,99,235,0.65)] active:scale-95 cursor-pointer md:-left-8 md:flex md:hover:shadow-[0_32px_85px_-34px_rgba(37,99,235,0.7)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button className="swiper-button-next-custom absolute right-1.5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-3 text-blue-600 shadow-[0_20px_45px_-28px_rgba(37,99,235,0.8)] ring-1 ring-blue-100/70 backdrop-blur transition-all duration-300 hover:-translate-y-1/2 hover:scale-115 hover:bg-white hover:shadow-[0_28px_70px_-32px_rgba(37,99,235,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:shadow-[0_24px_65px_-30px_rgba(37,99,235,0.65)] active:scale-95 cursor-pointer md:-right-8 md:flex md:hover:shadow-[0_32px_85px_-34px_rgba(37,99,235,0.7)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Custom Pagination */}
        <div className="swiper-pagination-custom mt-6 flex justify-center"></div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-500">Hơn {rooms.length} lựa chọn chất lượng</p>
        <Button
          onClick={handleViewMore}
          size="lg"
          className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 px-10 py-5 text-lg font-semibold text-white shadow-[0_25px_70px_-30px_rgba(14,165,233,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_32px_80px_-28px_rgba(37,99,235,0.65)]"
        >
          <span className="relative z-10">Xem tất cả phòng</span>
          <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Button>
        <p className="text-sm text-muted-foreground">Chọn phòng phù hợp và đặt lịch xem ngay trong vài giây.</p>
      </div>

      <style jsx global>{`
        .featured-rooms-swiper .swiper-pagination-bullet {
          background: linear-gradient(135deg, #3b82f6, #22d3ee);
          opacity: 0.4;
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .featured-rooms-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.15);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .featured-rooms-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </Wrapper>
  )
}