"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TransportServiceCard from "@/components/TransportServiceCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Phone,
  MessageCircle,
  Send,
  Truck,
  Package,
  MapPin,
  Star,
  Clock,
  Award,
  DollarSign,
  ArrowLeft,
} from "lucide-react"
import { TRANSPORT_SERVICES } from "@/lib/mock-data/transport-services"
import type { TransportService } from "@/types/transport"

export default function TransportServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<TransportService | null>(null)
  const [similarServices, setSimilarServices] = useState<TransportService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceDetail = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const serviceId = parseInt(params.id as string)
      const foundService = TRANSPORT_SERVICES.find((s) => s.id === serviceId)

      if (!foundService) {
        notFound()
      }

      setService(foundService)

      // Find similar services (same vehicle type or operating area)
      const similar = TRANSPORT_SERVICES.filter((s) => {
        if (s.id === serviceId) return false

        // Check if has same vehicle type
        const hasSameVehicle = s.vehicle_types.some((type) =>
          foundService.vehicle_types.includes(type)
        )

        // Check if operates in same area
        const hasSameArea = s.operating_areas.some((area) =>
          foundService.operating_areas.includes(area)
        )

        return hasSameVehicle || hasSameArea
      }).slice(0, 3)

      setSimilarServices(similar)
      setLoading(false)
    }

    fetchServiceDetail()
  }, [params.id])

  const formatPrice = (price: number, type: "per_km" | "per_trip") => {
    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)

    return type === "per_km" ? `${formatted}/km` : `${formatted}/chuyến`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-blue-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-0">
                {/* Banner */}
                <div className="p-6 bg-gradient-to-r from-blue-500 to-sky-500">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Truck className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-white mb-2">
                        {service.name}
                      </h1>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-white">
                            {service.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-white/80 ml-1">
                            ({service.total_reviews} đánh giá)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <Award className="h-4 w-4 text-white" />
                          <span className="text-sm text-white">
                            {service.experience_years} năm kinh nghiệm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giờ hoạt động</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {service.available_hours}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Khu vực</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {service.operating_areas.length} quận/huyện
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giá dịch vụ</p>
                      <p className="text-sm font-semibold text-orange-600">
                        {service.price_type === "per_km" && service.price_per_km
                          ? formatPrice(service.price_per_km, "per_km")
                          : service.price_per_trip
                            ? formatPrice(service.price_per_trip, "per_trip")
                            : "Liên hệ"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả dịch vụ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>

            {/* Vehicle Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Loại xe phục vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.vehicle_types.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-4 py-2"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goods Supported */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Loại hàng hóa hỗ trợ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.goods_supported.map((goods) => (
                    <Badge
                      key={goods}
                      variant="outline"
                      className="text-sm bg-green-50 text-green-700 border-green-200 px-4 py-2"
                    >
                      {goods}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operating Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Khu vực hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.operating_areas.map((area) => (
                    <Badge
                      key={area}
                      variant="outline"
                      className="text-sm bg-red-50 text-red-700 border-red-200 px-4 py-2"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={() => (window.location.href = `tel:${service.phone}`)}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {service.phone}
                </Button>

                {/* Zalo */}
                {service.zalo && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                    size="lg"
                    onClick={() =>
                      window.open(`https://zalo.me/${service.zalo}`, "_blank")
                    }
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat qua Zalo
                  </Button>
                )}

                {/* Messenger */}
                {service.messenger && (
                  <Button
                    variant="outline"
                    className="w-full border-sky-500 text-sky-600 hover:bg-sky-50"
                    size="lg"
                    onClick={() =>
                      window.open(
                        `https://m.me/${service.messenger}`,
                        "_blank"
                      )
                    }
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Chat qua Messenger
                  </Button>
                )}

                <Separator />

                {/* Additional Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {service.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Số đánh giá:</span>
                    <span className="font-semibold">
                      {service.total_reviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kinh nghiệm:</span>
                    <span className="font-semibold">
                      {service.experience_years} năm
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giờ hoạt động:</span>
                    <span className="font-semibold">
                      {service.available_hours}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Services */}
        {similarServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Các dịch vụ tương tự</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarServices.map((service) => (
                <TransportServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
