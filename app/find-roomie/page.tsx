"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import RoomieFilterSidebar from "@/components/RoomieFilterSidebar"
import RoomieCard from "@/components/RoomieCard"
import Footer from "@/components/Footer"
import { Sparkles, Loader2 } from "lucide-react"
import { FIND_ROOMIE_LIST, filterRoomies, sortRoomies } from "@/lib/mock-data/find-roomie"
import type { Roomie } from "@/types/roomie"

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export default function FindRoomiePage() {
  const searchParams = useSearchParams()
  const [roomies, setRoomies] = useState<Roomie[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({})

  const hasFilters = Object.keys(currentFilters).length > 0

  const filterHighlights = useMemo(() => {
    const highlights: string[] = []
    const minPrice = typeof currentFilters.min_price === "number" ? currentFilters.min_price : undefined
    const maxPrice = typeof currentFilters.max_price === "number" ? currentFilters.max_price : undefined
    const minAge = typeof currentFilters.min_age === "number" ? currentFilters.min_age : undefined
    const maxAge = typeof currentFilters.max_age === "number" ? currentFilters.max_age : undefined
    const gender = typeof currentFilters.gender === "string" ? currentFilters.gender : undefined
    const occupation = typeof currentFilters.occupation === "string" ? currentFilters.occupation : undefined
    const lifestyle = typeof currentFilters.lifestyle === "string" ? currentFilters.lifestyle : undefined
    const preferredArea = typeof currentFilters.preferred_area === "string" ? currentFilters.preferred_area : undefined
    const roomType = typeof currentFilters.room_type === "string" ? currentFilters.room_type : undefined

    if (minPrice !== undefined && maxPrice !== undefined) {
      highlights.push(`Ngân sách: ${currencyFormatter.format(minPrice)} - ${currencyFormatter.format(maxPrice)}`)
    } else if (minPrice !== undefined) {
      highlights.push(`Từ ${currencyFormatter.format(minPrice)} trở lên`)
    } else if (maxPrice !== undefined) {
      highlights.push(`Tối đa ${currencyFormatter.format(maxPrice)}`)
    }

    if (minAge !== undefined && maxAge !== undefined) {
      highlights.push(`Độ tuổi: ${minAge} - ${maxAge}`)
    }

    if (gender) {
      highlights.push(`Giới tính: ${gender}`)
    }

    if (occupation) {
      highlights.push(`${occupation}`)
    }

    if (lifestyle) {
      highlights.push(`Sinh hoạt: ${lifestyle}`)
    }

    if (preferredArea) {
      highlights.push(`Khu vực: ${preferredArea}`)
    }

    if (roomType) {
      highlights.push(`Loại phòng: ${roomType}`)
    }

    return highlights
  }, [currentFilters])

  // Fetch and filter roomies
  useEffect(() => {
    const fetchRoomies = async () => {
      setLoading(true)
      
      // Convert URL search params to filters object
      const filters = {
        min_price: searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!) : undefined,
        max_price: searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!) : undefined,
        min_age: searchParams.get("min_age") ? parseInt(searchParams.get("min_age")!) : undefined,
        max_age: searchParams.get("max_age") ? parseInt(searchParams.get("max_age")!) : undefined,
        gender: searchParams.get("gender") || undefined,
        occupation: searchParams.get("occupation") || undefined,
        school: searchParams.get("school") || undefined,
        lifestyle: searchParams.get("lifestyle") || undefined,
        preferred_area: searchParams.get("preferred_area") || undefined,
        room_type: searchParams.get("room_type") || undefined,
        latitude: searchParams.get("latitude") ? parseFloat(searchParams.get("latitude")!) : undefined,
        longitude: searchParams.get("longitude") ? parseFloat(searchParams.get("longitude")!) : undefined,
        radius: searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : undefined,
      }

      // Remove undefined values
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined))
      
      setCurrentFilters(cleanFilters)
      console.log("🔄 Applying filters:", cleanFilters)

      // Simulate API loading
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Apply filters
      const filtered = filterRoomies(FIND_ROOMIE_LIST, cleanFilters)
      const sorted = sortRoomies(filtered, "-created_at")

      setRoomies(sorted)
      setLoading(false)
    }

    fetchRoomies()
  }, [searchParams])

  return (
    <div className="space-y-16">
      <section className="space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Tìm bạn ở ghép</h1>
          {hasFilters ? (
            <div className="flex flex-col items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1 text-sm font-semibold text-blue-600">
                <Sparkles className="h-4 w-4" />
                Bộ lọc đang áp dụng
              </span>
              {filterHighlights.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {filterHighlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground md:text-base">
              Chọn bộ lọc ở thanh bên trái để thu hẹp danh sách và tìm nhanh bạn ở ghép phù hợp nhất.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left sidebar for filters */}
          <aside className="lg:sticky lg:top-8 lg:h-fit lg:w-80">
            <RoomieFilterSidebar />
          </aside>

          {/* Main content area for roomie listings */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách...</p>
              </div>
            ) : roomies.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Tìm thấy <span className="font-semibold text-foreground">{roomies.length}</span> hồ sơ phù hợp
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                  {roomies.map((roomie) => (
                    <RoomieCard key={roomie.id} roomie={roomie} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-foreground">Không tìm thấy kết quả</h3>
                  <p className="text-muted-foreground max-w-md">
                    Không tìm thấy bạn ở ghép phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc xóa một số tiêu
                    chí.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
