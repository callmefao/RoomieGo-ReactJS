"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, GraduationCap, MapPin, Sparkles, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { memo } from "react"
import type { Roomie } from "@/types/roomie"
import { cn } from "@/lib/utils"

interface RoomieCardProps {
  roomie: Roomie
}

function RoomieCard({ roomie }: RoomieCardProps) {
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleCardClick = () => {
    router.push(`/find-roomie/${roomie.id}`)
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
    return roomie.occupation === "Sinh viên" ? (
      <GraduationCap className="h-4 w-4" />
    ) : (
      <Briefcase className="h-4 w-4" />
    )
  }

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 bg-white border border-gray-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-sky-50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-2 group"
      onClick={handleCardClick}
    >

      <CardContent className="p-6">
        {/* Avatar và thông tin cơ bản */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative h-20 w-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-blue-100">
            <Image
              src={roomie.avatar}
              alt={roomie.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xl mb-2 text-foreground">
              {roomie.name}, {roomie.age} tuổi
            </h3>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn("inline-flex items-center gap-1", getGenderColor(roomie.gender))}
              >
                <Users className="h-3.5 w-3.5" />
                {roomie.gender}
              </Badge>

              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 border-blue-200 text-blue-700 bg-blue-50"
              >
                {getOccupationIcon()}
                {roomie.occupation}
              </Badge>
            </div>

            {roomie.school && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                🎓 {roomie.school}
              </p>
            )}
          </div>
        </div>

        {/* Mô tả */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {roomie.description}
        </p>

        {/* Khu vực mong muốn */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Khu vực mong muốn:</p>
            <div className="flex flex-wrap gap-1">
              {roomie.preferred_areas.slice(0, 2).map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {roomie.preferred_areas.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{roomie.preferred_areas.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tiêu chí */}
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Tiêu chí:</p>
          <div className="flex flex-wrap gap-1">
            {roomie.preferences.slice(0, 3).map((pref, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-green-200 text-green-700 bg-green-50"
              >
                {pref}
              </Badge>
            ))}
            {roomie.preferences.length > 3 && (
              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                +{roomie.preferences.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Ngân sách và lifestyle */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ngân sách:</span>
            <span className="font-medium text-foreground">
              {formatPrice(roomie.budget_min)} - {formatPrice(roomie.budget_max)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sinh hoạt:</span>
            <Badge variant="outline" className="text-xs">
              {roomie.lifestyle}
            </Badge>
          </div>
        </div>

        {/* Loại phòng */}
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Loại phòng: <span className="font-medium text-foreground">{roomie.room_type}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize component để tránh re-render không cần thiết
export default memo(RoomieCard, (prevProps, nextProps) => {
  return prevProps.roomie.id === nextProps.roomie.id
})
