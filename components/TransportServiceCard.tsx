"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Truck,
  MapPin,
  Star,
  Phone,
  Package,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TransportService } from "@/types/transport"

interface TransportServiceCardProps {
  service: TransportService
}

function TransportServiceCardComponent({
  service,
}: TransportServiceCardProps) {
  const router = useRouter()

  const formatPrice = (price: number, type: "per_km" | "per_trip") => {
    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)

    return type === "per_km" ? `${formatted}/km` : `${formatted}/chuyến`
  }

  const handleCardClick = () => {
    router.push(`/transport-services/${service.id}`)
  }

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 bg-white border border-gray-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-sky-50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-2 group"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Header với tên và rating */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-sky-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                {service.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">
                    {service.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-white/80">
                  ({service.total_reviews} đánh giá)
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Loại xe */}
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Loại xe</p>
              <div className="flex flex-wrap gap-1">
                {service.vehicle_types.map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Loại hàng */}
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Loại hàng chở</p>
              <div className="flex flex-wrap gap-1">
                {service.goods_supported.slice(0, 3).map((goods) => (
                  <Badge
                    key={goods}
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    {goods}
                  </Badge>
                ))}
                {service.goods_supported.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                  >
                    +{service.goods_supported.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Khu vực */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Khu vực hoạt động</p>
              <p className="text-sm text-gray-700 line-clamp-1">
                {service.operating_areas.join(", ")}
              </p>
            </div>
          </div>

          {/* Giá và nút liên hệ */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-lg font-bold text-orange-600">
                  {service.price_type === "per_km" && service.price_per_km
                    ? formatPrice(service.price_per_km, "per_km")
                    : service.price_per_trip
                      ? formatPrice(service.price_per_trip, "per_trip")
                      : "Liên hệ"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `tel:${service.phone}`
              }}
            >
              <Phone className="h-4 w-4 mr-1" />
              Gọi ngay
            </Button>
          </div>

          {/* Kinh nghiệm */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            🏆 {service.experience_years} năm kinh nghiệm • {service.available_hours}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize component để tránh re-render không cần thiết
export default memo(TransportServiceCardComponent, (prevProps, nextProps) => {
  return prevProps.service.id === nextProps.service.id
})
