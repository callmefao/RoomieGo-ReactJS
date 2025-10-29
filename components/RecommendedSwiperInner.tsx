"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import type { Room } from "@/types/room"
import RoomCard from "./RoomCard"
import { useRef } from "react"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface Props {
  rooms: Room[]
}

export default function RecommendedSwiperInner({ rooms }: Props) {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const paginationRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        loop={false}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        watchSlidesProgress={true}
        observer={true}
        observeParents={true}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        onBeforeInit={(swiper) => {
          // bind the navigation and pagination elements (refs may be null initially but Swiper will handle)
          // @ts-ignore
          swiper.params.navigation = swiper.params.navigation || {}
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current
          // @ts-ignore
          swiper.params.pagination = swiper.params.pagination || {}
          // @ts-ignore
          swiper.params.pagination.el = paginationRef.current
        }}
        className="recommended-rooms-swiper mb-6"
      >
        {rooms.map((r) => (
          <SwiperSlide key={`rec-${r.id}`}>
            <RoomCard room={r} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons (placed inside same container to ensure Swiper can bind them) */}
      <button ref={prevRef} aria-label="Trước" className="swiper-button-prev-custom absolute left-1.5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-3 text-blue-600 shadow-[0_20px_45px_-28px_rgba(37,99,235,0.8)] ring-1 ring-blue-100/70 backdrop-blur transition-all duration-300 hover:-translate-y-1/2 hover:scale-115 hover:bg-white hover:shadow-[0_28px_70px_-32px_rgba(37,99,235,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:shadow-[0_24px_65px_-30px_rgba(37,99,235,0.65)] active:scale-95 cursor-pointer md:-left-8 md:flex md:hover:shadow-[0_32px_85px_-34px_rgba(37,99,235,0.7)]">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button ref={nextRef} aria-label="Tiếp" className="swiper-button-next-custom absolute right-1.5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/95 p-3 text-blue-600 shadow-[0_20px_45px_-28px_rgba(37,99,235,0.8)] ring-1 ring-blue-100/70 backdrop-blur transition-all duration-300 hover:-translate-y-1/2 hover:scale-115 hover:bg-white hover:shadow-[0_28px_70px_-32px_rgba(37,99,235,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:shadow-[0_24px_65px_-30px_rgba(37,99,235,0.65)] active:scale-95 cursor-pointer md:-right-8 md:flex md:hover:shadow-[0_32px_85px_-34px_rgba(37,99,235,0.7)]">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div ref={paginationRef} className="swiper-pagination-custom mt-6 flex justify-center" />
    </div>
  )
}
