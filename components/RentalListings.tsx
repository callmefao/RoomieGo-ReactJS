"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { ChevronLeft, ChevronRight, MapPin, Users, Square, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRooms } from "@/hooks/useRooms"
import RoomsService from "@/lib/rooms-service"
import { generateRentalSlug } from "@/lib/utils/url"
import type { Room, RoomFilters } from "@/types/room"
import { formatAmenities } from "@/utils/room-helpers"

interface RentalListingsProps {
  initialFilters?: Record<string, any>
  filters?: {
    status?: number // 1 = available, 0 = not available
    featured?: boolean
    verified?: boolean
    priceRange?: [number, number]
    areaRange?: [number, number]
    maxPeople?: number
    search?: string
    sortBy?: 'price' | 'area' | 'date'
    sortOrder?: 'asc' | 'desc'
  }
}

export default function RentalListings({ initialFilters, filters }: RentalListingsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const router = useRouter()
  
  // Build filters for API
  const apiFilters = useMemo(() => {
    
    // Start with initial filters from URL params
    let baseFilters: RoomFilters = initialFilters || {}
    
    // Add default status filter if not present
    if (!baseFilters.status && !filters?.status) {
      baseFilters.status = 1 // Available rooms by default
    }
    
    if (!filters) {
      console.log("📤 RentalListings final API filters:", baseFilters)
      return baseFilters as RoomFilters
    }
    
    // Merge with UI filters
    if (filters.status !== undefined) {
      baseFilters.status = filters.status
    }
    if (filters.featured !== undefined) {
      baseFilters.is_featured = filters.featured
    }
    if (filters.verified !== undefined) {
      baseFilters.is_verified = filters.verified
    }
    if (filters.priceRange) {
      baseFilters.min_price = filters.priceRange[0]
      baseFilters.max_price = filters.priceRange[1]
    }
    if (filters.areaRange) {
      baseFilters.min_area = filters.areaRange[0]
      baseFilters.max_area = filters.areaRange[1]
    }
    if (filters.maxPeople !== undefined) {
      baseFilters.max_people = filters.maxPeople
    }
    if (filters.search) {
      baseFilters.search = filters.search
    }
    if (filters.sortBy && filters.sortOrder) {
      const sortPrefix = filters.sortOrder === 'desc' ? '-' : ''
      baseFilters.ordering = `${sortPrefix}${filters.sortBy}` as any
    }
    
    console.log("📤 RentalListings final API filters:", baseFilters)
    return baseFilters
  }, [initialFilters, filters])

  // Use the custom hook to fetch rooms
  const { rooms, loading, error, totalCount, refetch } = useRooms(apiFilters)

  const hasSelectedFilters = useMemo(() => {
    const normalizeValue = (value: unknown) => {
      if (typeof value === "string") {
        return value.trim()
      }
      return value
    }

    const filterEntries = Object.entries(apiFilters ?? {}).filter(([key]) => key !== "status" && key !== "page")

    const hasExtraFilters = filterEntries.some(([, value]) => {
      const normalized = normalizeValue(value)
      if (normalized === undefined || normalized === null || normalized === "") {
        return false
      }
      if (Array.isArray(normalized)) {
        return normalized.some((item) => normalizeValue(item) !== undefined && normalizeValue(item) !== "")
      }
      if (typeof normalized === "number") {
        return true
      }
      if (typeof normalized === "boolean") {
        return normalized
      }
      return true
    })

    const statusValue = filters?.status ?? initialFilters?.status ?? apiFilters?.status
    const statusNumber = typeof statusValue === "string" ? Number(statusValue) : statusValue
    const statusFiltered = statusNumber !== undefined && statusNumber !== 1

    return hasExtraFilters || statusFiltered
  }, [apiFilters, filters?.status, initialFilters?.status])

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount)

  // Get current page items (rooms are already paginated by API, but we'll handle client-side for now)
  const currentItems = rooms.slice(0, itemsPerPage)

  const handleCardClick = (room: Room) => {
    // Sử dụng generateRentalSlug để thống nhất với homepage
    const slug = generateRentalSlug(room.title, room.id)
    router.push(`/${slug}`)
  }

  const handleSeeMore = (room: Room) => {
    // Sử dụng generateRentalSlug để thống nhất với homepage
    const slug = generateRentalSlug(room.title, room.id)
    router.push(`/${slug}`)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      // In a real implementation, you'd update the API filters with page parameter
      // For now, we'll just update the current page
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      // In a real implementation, you'd update the API filters with page parameter
    }
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
    // In a real implementation, you'd update the API filters with page parameter
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-48 h-32 bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-5 bg-muted animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
                <div className="w-24 h-10 bg-muted animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5C3.498 20.333 4.46 22 6 22z" />
          </svg>
          <p className="text-lg font-semibold">Không thể tải dữ liệu phòng trọ</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600 max-w-md mx-auto">
          <p><strong>Các nguyên nhân có thể:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Django server chưa được khởi động trên port 8000</li>
            <li>Cấu hình CORS chưa đúng</li>
            <li>URL API không chính xác: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}</li>
          </ul>
        </div>
        
        <div className="mt-6 space-x-4">
          <Button onClick={() => refetch()} variant="outline">
            Thử lại
          </Button>
          <Button 
            onClick={() => router.push('/api-test')} 
            variant="secondary"
          >
            Test API
          </Button>
        </div>
      </div>
    )
  }

  // No results
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-semibold">Không tìm thấy phòng trọ</p>
          <p className="text-sm mt-2">Thử thay đổi bộ lọc tìm kiếm của bạn</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {currentItems.map((room) => {
          const amenities = formatAmenities(room.amenities_detail ?? room.amenities)

          return (
          <Card 
            key={room.id} 
            className="w-full cursor-pointer group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 border hover:border-blue-200"
            onClick={() => handleSeeMore(room)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:space-x-6">
                {/* Left: Enhanced Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted shadow-lg transition-all duration-300 group-hover:shadow-xl sm:h-56 sm:w-64 md:h-40 md:w-56">
                  <Image 
                    src={RoomsService.getRoomMainImage(room)} 
                    alt={room.title} 
                    fill 
                    className="object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                      room.status === 1 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {room.status === 1 ? 'Còn trống' : 'Không có sẵn'}
                    </span>
                  </div>

                  {/* Featured badge */}
                  {room.is_featured && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Nổi bật
                      </span>
                    </div>
                  )}
                </div>

                {/* Center: Enhanced Rental Information */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Tên Trọ</div>
                    <div className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-blue-600 sm:text-2xl">
                      {room.title}
                    </div>
                    {room.is_verified && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Đã xác minh</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Giá thuê</div>
                    <div className="text-xl font-bold text-red-600 transition-colors duration-300 group-hover:text-red-700 sm:text-2xl">
                      {RoomsService.formatPrice(room.price)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Địa chỉ</div>
                    <div className="flex items-start gap-2 text-base text-foreground transition-colors duration-300 group-hover:text-gray-700 sm:text-lg">
                      <MapPin className="mt-1 h-4 w-4 text-gray-500" />
                      {room.location}
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>{room.area}m²</span>
                    </div>
                    {room.max_people && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Tối đa {room.max_people} người</span>
                      </div>
                    )}
                    {room.has_mezzanine && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 border border-blue-200">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="font-medium">Có gác</span>
                      </div>
                    )}
                  </div>

                  {/* Utility costs */}
                  {(room.deposit || room.electricity_price || room.water_price) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm border-t pt-3">
                      {room.deposit && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-amber-700">Cọc: {RoomsService.formatPrice(room.deposit)}</span>
                        </div>
                      )}
                      {room.electricity_price && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Điện: {RoomsService.formatPrice(room.electricity_price)}/kWh</span>
                        </div>
                      )}
                      {room.water_price && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Nước: {RoomsService.formatPrice(room.water_price)}/m³</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amenities preview */}
                  {amenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={amenity.id ?? amenity.slug ?? `${amenity.name}-${index}`}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {amenity.icon_url ? (
                            <img
                              src={amenity.icon_url}
                              alt={amenity.name}
                              className="h-4 w-4"
                            />
                          ) : null}
                          {amenity.name}
                        </span>
                      ))}
                      {amenities.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{amenities.length - 3} tiện ích khác
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Trước</span>
          </Button>

          <div className="flex items-center space-x-1">
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              let page: number
              if (totalPages <= 5) {
                page = index + 1
              } else {
                // Show pages around current page
                const start = Math.max(1, currentPage - 2)
                const end = Math.min(totalPages, start + 4)
                page = start + index
                if (page > end) return null
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 bg-transparent"
          >
            <span>Sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Hiển thị {startIndex + 1}-{endIndex} của {totalCount} kết quả
      </div>
    </div>
  )
}
