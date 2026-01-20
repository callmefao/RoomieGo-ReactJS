"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Clock,
  Users,
  Home,
  DollarSign,
  Calendar,
  Eye,
  MessageCircle,
} from "lucide-react"
import type { Roomie } from "@/types/roomie"
import Footer from "@/components/Footer"
import RoomieCard from "@/components/RoomieCard"
import { findRoomieService } from "@/lib/findroomie-service"
import { mapApiResponseToRoomie } from "@/lib/utils/findroomie-mapper"
import { FIND_ROOMIE_DEFAULTS } from "@/lib/utils/findroomie-constants"

export default function RoomieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [roomie, setRoomie] = useState<Roomie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarRoomies, setSimilarRoomies] = useState<Roomie[]>([])

  useEffect(() => {
    const fetchRoomie = async () => {
      setLoading(true)
      setError(null)

      try {
        const id = Number(params.id)
        
        // Fetch roomie detail from API
        const apiResponse = await findRoomieService.getRoommateById(id)
        const mappedRoomie = mapApiResponseToRoomie(apiResponse)
        setRoomie(mappedRoomie)

        // Fetch similar roomies with same filters
        const similarResponse = await findRoomieService.getRoommates({
          gender: apiResponse.gender,
          ordering: FIND_ROOMIE_DEFAULTS.SORT_ORDER,
        })

        // Filter and map similar roomies
        const similar = similarResponse.results
          .filter(r => {
            if (r.id === id) return false
            // Similar age range (within configured years)
            return Math.abs(r.age - apiResponse.age) <= FIND_ROOMIE_DEFAULTS.SIMILAR_AGE_RANGE
          })
          .slice(0, FIND_ROOMIE_DEFAULTS.SIMILAR_ROOMIES_COUNT)
          .map(mapApiResponseToRoomie)

        setSimilarRoomies(similar)
      } catch (err) {
        console.error('❌ Error fetching roomie detail:', err)
        setError('Không thể tải thông tin hồ sơ.')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomie()
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "Nam":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Nữ":
        return "bg-pink-50 text-pink-700 border-pink-200"
      default:
        return "bg-purple-50 text-purple-700 border-purple-200"
    }
  }

  const getOccupationIcon = () => {
    return roomie?.occupation === "Sinh viên" ? (
      <GraduationCap className="h-5 w-5" />
    ) : (
      <Briefcase className="h-5 w-5" />
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!roomie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">{error ? '⚠️' : '😔'}</div>
          <h2 className="text-2xl font-semibold text-foreground">
            {error ? 'Đã có lỗi xảy ra' : 'Không tìm thấy hồ sơ'}
          </h2>
          <p className="text-muted-foreground">
            {error || 'Hồ sơ bạn đang tìm không tồn tại hoặc đã bị xóa.'}
          </p>
          <Button onClick={() => router.push("/find-roomie")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Back Button */}
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => router.push("/find-roomie")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="relative h-32 w-32 flex-shrink-0 rounded-full overflow-hidden border-4 border-blue-100 mx-auto md:mx-0">
                    <Image src={roomie.avatar} alt={roomie.name} fill className="object-cover" unoptimized />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {roomie.name}, {roomie.age} tuổi
                      </h1>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={getGenderColor(roomie.gender)}>
                          <Users className="h-4 w-4 mr-1" />
                          {roomie.gender}
                        </Badge>

                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                          {getOccupationIcon()}
                          <span className="ml-1">{roomie.occupation}</span>
                        </Badge>

                        {roomie.view_count && (
                          <Badge variant="outline" className="border-gray-200 text-gray-600">
                            <Eye className="h-4 w-4 mr-1" />
                            {roomie.view_count} lượt xem
                          </Badge>
                        )}
                      </div>

                      {roomie.school && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          {roomie.school}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Đăng ngày {formatDate(roomie.created_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Mô tả bản thân
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{roomie.description}</p>
              </CardContent>
            </Card>

            {/* Criteria Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Tiêu chí tìm bạn ở ghép
                </h2>

                <div className="space-y-6">
                  {/* Preferred Areas */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Khu vực mong muốn</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {roomie.preferred_areas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Room Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Loại phòng</h3>
                    </div>
                    <p className="text-muted-foreground ml-7">{roomie.room_type}</p>
                  </div>

                  <Separator />

                  {/* Preferences */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Yêu cầu bạn ở ghép</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {roomie.preferences.map((pref, index) => (
                        <Badge key={index} variant="outline" className="border-green-200 text-green-700 bg-green-50">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Budget */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Ngân sách dự kiến</h3>
                    </div>
                    <p className="text-muted-foreground ml-7 font-medium">
                      {formatPrice(roomie.budget_min)} - {formatPrice(roomie.budget_max)}/tháng
                    </p>
                  </div>

                  <Separator />

                  {/* Lifestyle */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Thời gian sinh hoạt</h3>
                    </div>
                    <Badge variant="outline" className="ml-7">
                      {roomie.lifestyle}
                    </Badge>
                  </div>

                  {/* Additional Requirements */}
                  {roomie.additional_requirements && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Yêu cầu khác</h3>
                        <p className="text-muted-foreground leading-relaxed">{roomie.additional_requirements}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin liên hệ</h3>

                  <Button className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Liên hệ ngay
                  </Button>

                  {roomie.contact_phone && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <a
                        href={`tel:${roomie.contact_phone}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {roomie.contact_phone}
                      </a>
                    </div>
                  )}

                  {roomie.contact_hours && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Giờ liên hệ
                      </p>
                      <p className="text-sm font-medium">{roomie.contact_hours}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Lưu ý:</strong> Hãy liên hệ trực tiếp để trao đổi chi tiết và xác nhận thông tin
                      trước khi quyết định.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin nhanh</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tuổi:</span>
                      <span className="font-medium">{roomie.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giới tính:</span>
                      <span className="font-medium">{roomie.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nghề nghiệp:</span>
                      <span className="font-medium">{roomie.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sinh hoạt:</span>
                      <span className="font-medium">{roomie.lifestyle}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar Profiles Section */}
        {similarRoomies.length > 0 && (
          <div className="mt-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Các hồ sơ tương tự</h2>
              <p className="text-muted-foreground">
                Những người cũng đang tìm bạn ở ghép với tiêu chí tương đồng
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {similarRoomies.map((similar) => (
                <RoomieCard key={similar.id} roomie={similar} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
