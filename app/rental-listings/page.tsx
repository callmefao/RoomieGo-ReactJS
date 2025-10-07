"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import RentalListings from "@/components/RentalListings"
import FilterSidebar from "@/components/FilterSidebar"
import Footer from "@/components/Footer"
import { Sparkles } from "lucide-react"

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export default function RentalListingsPage() {
  const searchParams = useSearchParams()
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({})
  const hasFilters = Object.keys(currentFilters).length > 0
  const filterHighlights = useMemo(() => {
    const highlights: string[] = []
    const minPrice = typeof currentFilters.min_price === "number" ? currentFilters.min_price : undefined
    const maxPrice = typeof currentFilters.max_price === "number" ? currentFilters.max_price : undefined
    const radius = typeof currentFilters.radius === "number" ? currentFilters.radius : undefined
    const search = typeof currentFilters.search === "string" && currentFilters.search.trim() ? currentFilters.search.trim() : undefined

    if (minPrice !== undefined && maxPrice !== undefined) {
      highlights.push(`Khoảng giá: ${currencyFormatter.format(minPrice)} - ${currencyFormatter.format(maxPrice)}`)
    } else if (minPrice !== undefined) {
      highlights.push(`Từ ${currencyFormatter.format(minPrice)} trở lên`)
    } else if (maxPrice !== undefined) {
      highlights.push(`Tối đa ${currencyFormatter.format(maxPrice)}`)
    }

    if (radius !== undefined) {
      highlights.push(`Trong bán kính ${radius}km quanh vị trí bạn chọn`)
    }

    if (search) {
      highlights.push(`Từ khóa: “${search}”`)
    }

    return highlights
  }, [currentFilters])
  
  // Convert URL search params to filters object
  const filters = {
    search: searchParams.get('search') || undefined,
    min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
    longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
    radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined,
  }
  
  // Remove undefined values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  )

  // Update current filters when URL params change
  useEffect(() => {
    setCurrentFilters(cleanFilters)
    console.log("🔄 URL params changed, updated filters:", cleanFilters)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Tìm chỗ ở ưng ý cho bạn</h1>
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
              Chọn bộ lọc ở thanh bên trái để thu hẹp danh sách và tìm nhanh căn phòng phù hợp nhất.
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar for filters */}
          <aside className="lg:w-80 lg:sticky lg:top-8 lg:h-fit">
            <FilterSidebar />
          </aside>

          {/* Main content area for rental listings */}
          <div className="flex-1">
            <RentalListings initialFilters={currentFilters} key={JSON.stringify(currentFilters)} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
