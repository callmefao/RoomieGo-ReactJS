"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
// import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TransportServiceCard from "@/components/TransportServiceCard"
import TransportFilterSidebar from "@/components/TransportFilterSidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TRANSPORT_SERVICES,
  filterTransportServices,
  sortTransportServices,
} from "@/lib/mock-data/transport-services"
import type { TransportFilters } from "@/types/transport"
import { Truck } from "lucide-react"

export default function TransportServicesPage() {
  const searchParams = useSearchParams()
  const [services, setServices] = useState(TRANSPORT_SERVICES)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<
    "rating" | "reviews" | "price_low" | "price_high" | "experience"
  >("rating")

  // Parse filters from URL search params
  const [filters, setFilters] = useState<TransportFilters>({})

  useEffect(() => {
    // Simulate API loading
    const fetchServices = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Create filters from search params
      const newFilters: TransportFilters = {}

      const areas = searchParams.get("areas")
      if (areas) {
        newFilters.areas = areas.split(",")
      }

      const vehicleTypes = searchParams.get("vehicle_types")
      if (vehicleTypes) {
        newFilters.vehicle_types = vehicleTypes.split(",") as any
      }

      const goodsTypes = searchParams.get("goods_types")
      if (goodsTypes) {
        newFilters.goods_types = goodsTypes.split(",") as any
      }

      const priceType = searchParams.get("price_type")
      if (priceType === "per_km" || priceType === "per_trip") {
        newFilters.price_type = priceType
      }

      const priceMin = searchParams.get("price_min")
      if (priceMin) {
        newFilters.price_min = parseInt(priceMin)
      }

      const priceMax = searchParams.get("price_max")
      if (priceMax) {
        newFilters.price_max = parseInt(priceMax)
      }

      const ratingMin = searchParams.get("rating_min")
      if (ratingMin) {
        newFilters.rating_min = parseFloat(ratingMin)
      }

      setFilters(newFilters)

      // Apply filters and sorting
      let filtered = filterTransportServices(TRANSPORT_SERVICES, newFilters)
      filtered = sortTransportServices(filtered, sortBy)

      setServices(filtered)
      setLoading(false)
    }

    fetchServices()
  }, [searchParams, sortBy])

  const handleFiltersChange = (newFilters: TransportFilters) => {
    setFilters(newFilters)

    // Apply filters
    let filtered = filterTransportServices(TRANSPORT_SERVICES, newFilters)
    filtered = sortTransportServices(filtered, sortBy)
    setServices(filtered)
  }

  const handleSortChange = (
    value: "rating" | "reviews" | "price_low" | "price_high" | "experience"
  ) => {
    setSortBy(value)
    const sorted = sortTransportServices(services, value)
    setServices(sorted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      {/* <Header /> */}

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tìm dịch vụ vận chuyển
              </h1>
              <p className="text-gray-600 mt-1">
                Kết nối với các dịch vụ vận chuyển uy tín tại Cần Thơ
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <TransportFilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Services List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">
                  Tìm thấy{" "}
                  <span className="font-bold text-blue-600">
                    {services.length}
                  </span>{" "}
                  dịch vụ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    <SelectItem value="reviews">Nhiều đánh giá nhất</SelectItem>
                    <SelectItem value="price_low">Giá thấp đến cao</SelectItem>
                    <SelectItem value="price_high">Giá cao đến thấp</SelectItem>
                    <SelectItem value="experience">
                      Kinh nghiệm nhiều nhất
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Truck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy dịch vụ
                </h3>
                <p className="text-gray-600 mb-6">
                  Vui lòng thử điều chỉnh bộ lọc của bạn
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <TransportServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
