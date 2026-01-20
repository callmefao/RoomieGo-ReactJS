"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import RoomieFilterSidebar from "@/components/RoomieFilterSidebar"
import RoomieCard from "@/components/RoomieCard"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Plus } from "lucide-react"
import type { Roomie } from "@/types/roomie"
import { findRoomieService, type FindRoomieFilters } from "@/lib/findroomie-service"
import { mapApiResponseToRoomie } from "@/lib/utils/findroomie-mapper"
import { FIND_ROOMIE_DEFAULTS } from "@/lib/utils/findroomie-constants"

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export default function FindRoomiePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomies, setRoomies] = useState<Roomie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const hasFilters = Object.keys(currentFilters).length > 0

  const filterHighlights = useMemo(() => {
    const highlights: string[] = []
    
    // Parse filters from currentFilters (which are the cleaned API params)
    const minBudget = currentFilters.min_budget
    const maxBudget = currentFilters.max_budget
    const minAge = currentFilters.min_age
    const maxAge = currentFilters.max_age
    const gender = currentFilters.gender
    const occupation = currentFilters.occupation
    const activityTime = currentFilters.activity_time
    const latitude = currentFilters.latitude
    const longitude = currentFilters.longitude
    const radius = currentFilters.radius

    // Gender filter
    if (gender) {
      const genderMap: Record<string, string> = {
        'male': 'Nam',
        'female': 'Nữ',
        'other': 'Khác'
      }
      highlights.push(`Giới tính: ${genderMap[gender] || gender}`)
    }

    // Occupation filter
    if (occupation) {
      const occupationMap: Record<string, string> = {
        'student': 'Sinh viên',
        'working': 'Đã đi làm'
      }
      highlights.push(occupationMap[occupation] || occupation)
    }

    // Activity time / Lifestyle filter
    if (activityTime) {
      const activityTimeMap: Record<string, string> = {
        'day': 'Ban ngày',
        'night': 'Ban đêm',
        'flexible': 'Linh hoạt'
      }
      highlights.push(`Sinh hoạt: ${activityTimeMap[activityTime] || activityTime}`)
    }

    // Age range filter
    if (minAge !== undefined && maxAge !== undefined) {
      highlights.push(`Độ tuổi: ${minAge} - ${maxAge}`)
    } else if (minAge !== undefined) {
      highlights.push(`Từ ${minAge} tuổi trở lên`)
    } else if (maxAge !== undefined) {
      highlights.push(`Tối đa ${maxAge} tuổi`)
    }

    // Budget filter
    if (minBudget !== undefined && maxBudget !== undefined) {
      highlights.push(`Ngân sách: ${currencyFormatter.format(minBudget)} - ${currencyFormatter.format(maxBudget)}`)
    } else if (minBudget !== undefined) {
      highlights.push(`Từ ${currencyFormatter.format(minBudget)} trở lên`)
    } else if (maxBudget !== undefined) {
      highlights.push(`Tối đa ${currencyFormatter.format(maxBudget)}`)
    }

    // Location filter
    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
      highlights.push(`Bán kính: ${radius}km`)
    }

    return highlights
  }, [currentFilters])

  // Fetch and filter roomies from API
  useEffect(() => {
    const fetchRoomies = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Map frontend filter params to API params
        const mapGenderParam = (gender: string | null) => {
          if (!gender) return undefined
          switch (gender.toLowerCase()) {
            case 'nam': return 'male'
            case 'nữ': return 'female'
            case 'khác': return 'other'
            default: return undefined
          }
        }

        const mapOccupationParam = (occupation: string | null) => {
          if (!occupation) return undefined
          return occupation.toLowerCase() === 'sinh viên' ? 'student' : 'working'
        }

        const mapLifestyleParam = (lifestyle: string | null) => {
          if (!lifestyle) return undefined
          switch (lifestyle.toLowerCase()) {
            case 'ban ngày': return 'day'
            case 'ban đêm': return 'night'
            case 'linh hoạt': return 'flexible'
            default: return undefined
          }
        }

        // Build API filters
        const apiFilters: FindRoomieFilters = {
          min_budget: searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!) : undefined,
          max_budget: searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!) : undefined,
          min_age: searchParams.get("min_age") ? parseInt(searchParams.get("min_age")!) : undefined,
          max_age: searchParams.get("max_age") ? parseInt(searchParams.get("max_age")!) : undefined,
          gender: mapGenderParam(searchParams.get("gender")),
          occupation: mapOccupationParam(searchParams.get("occupation")),
          activity_time: mapLifestyleParam(searchParams.get("lifestyle")),
          latitude: searchParams.get("latitude") ? parseFloat(searchParams.get("latitude")!) : undefined,
          longitude: searchParams.get("longitude") ? parseFloat(searchParams.get("longitude")!) : undefined,
          radius: searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : undefined,
          search: searchParams.get("search") || undefined,
          ordering: FIND_ROOMIE_DEFAULTS.SORT_ORDER,
        }

        // Remove undefined values for clean filters display
        const cleanFilters = Object.fromEntries(
          Object.entries(apiFilters).filter(([_, value]) => value !== undefined)
        )
        
        setCurrentFilters(cleanFilters)
        console.log("🔄 Fetching roomies with filters:", cleanFilters)

        // Fetch from API
        const response = await findRoomieService.getRoommates(apiFilters)
        
        // Map API response to frontend Roomie type
        const mappedRoomies = response.results.map(mapApiResponseToRoomie)
        
        // Remove duplicates by ID (just in case)
        const uniqueRoomies = Array.from(
          new Map(mappedRoomies.map(roomie => [roomie.id, roomie])).values()
        )
        
        console.log(`✅ Fetched ${uniqueRoomies.length} unique roomies`)
        setRoomies(uniqueRoomies)
      } catch (err) {
        console.error('❌ Error fetching roomies:', err)
        setError('Không thể tải danh sách. Vui lòng thử lại sau.')
        setRoomies([])
      } finally {
        setLoading(false)
      }
    }

    fetchRoomies()
  }, [searchParams])

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      setIsAuthenticated(!!token)
    }

    checkAuth()

    // Listen for auth changes
    window.addEventListener('authStateChanged', checkAuth)
    return () => window.removeEventListener('authStateChanged', checkAuth)
  }, [])

  return (
    <div className="space-y-16">
      <section className="space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-6">Tìm bạn ở ghép</h1>
          
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
            {/* Post button - only show when authenticated */}
            {isAuthenticated && (
              <div className="mb-6">
                <Button
                  onClick={() => router.push("/find-roomie/create")}
                  size="lg"
                  className="w-full px-8 py-4 text-lg font-medium rounded-full cursor-pointer bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-cyan-200/25 transition-all duration-300 active:scale-95 hover:scale-105 gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Đăng bài tìm bạn ở ghép
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Miễn phí • Dễ dàng • Nhanh chóng</p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-semibold text-foreground">Đã có lỗi xảy ra</h3>
                  <p className="text-muted-foreground max-w-md">{error}</p>
                </div>
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
