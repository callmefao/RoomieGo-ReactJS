"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, MapPin, Sparkles, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { memo } from "react"
import type { Room } from "@/types/room"
import { generateRentalSlug } from "@/lib/utils/url"
import { cn } from "@/lib/utils"
import { formatAmenities } from "@/utils/room-helpers"

interface RoomCardProps {
  room: Room
  highlighted?: boolean
}

function RoomCard({ room, highlighted = false }: RoomCardProps) {
  const router = useRouter()

  const getMainImage = (room: Room): string => {
    // Ưu tiên main_image_url từ backend
    if (room.main_image_url) {
      return room.main_image_url
    }
    
    // Fallback về ảnh đầu tiên trong images array
    if (room.images && room.images.length > 0) {
      const firstImage = room.images[0]
      return firstImage.optimized_url || firstImage.original_url
    }
    
    // Cuối cùng là placeholder
    return "/placeholder.svg"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const handleCardClick = () => {
    const slug = generateRentalSlug(room.title, room.id)
    router.push(`/${slug}`)
  }

  const amenities = formatAmenities(room.amenities_detail ?? room.amenities)

  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 backdrop-blur-sm group",
        highlighted
          ? "bg-white/90 border border-blue-200/70 shadow-[0_25px_70px_-35px_rgba(59,130,246,0.75)] hover:shadow-[0_28px_80px_-32px_rgba(14,165,233,0.65)] hover:-translate-y-2"
          : "bg-white/80 border border-blue-100/50 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1"
      )}
      onClick={handleCardClick}
    >
      {highlighted && (
        <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-600 shadow-[0_10px_30px_-20px_rgba(37,99,235,0.8)]">
          <Sparkles className="h-4 w-4" />
          Phòng nổi bật
        </div>
      )}

      {highlighted && (
        <div className="pointer-events-none absolute -inset-1 -z-[1] bg-gradient-to-r from-sky-200/60 via-blue-200/40 to-sky-300/60 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}

      <div className="aspect-video relative overflow-hidden">
        <Image
          src={getMainImage(room)}
          alt={room.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={highlighted}
          quality={75}
          unoptimized
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-2">
          {room.title}
        </h3>

        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{room.location}</span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground mb-3">
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span className="text-sm">{room.area}m²</span>
          </div>
          {room.has_mezzanine && (
            <Badge variant="outline" className="inline-flex items-center gap-1 border-blue-200 text-blue-700 bg-blue-50 text-xs">
              <Layers className="h-3.5 w-3.5" />
              Có gác
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {amenities.slice(0, 2).map((amenity, index) => (
            <Badge
              key={amenity.id ?? amenity.slug ?? `${amenity.name}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {amenity.icon_url ? (
                <Image
                  src={amenity.icon_url}
                  alt={amenity.name}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                  unoptimized
                />
              ) : null}
              {amenity.name}
            </Badge>
          ))}
          {amenities.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{amenities.length - 2}
            </Badge>
          )}
        </div>

        {/* Utility costs */}
        {(room.deposit || room.electricity_price || room.water_price) && (
          <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground">
            {room.deposit && (
              <span className="flex items-center gap-1">
                <span className="text-amber-600">💰</span>
                Cọc: {formatPrice(room.deposit)}
              </span>
            )}
            {room.electricity_price && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-600">⚡</span>
                Điện: {formatPrice(room.electricity_price)}/số
              </span>
            )}
            {room.water_price && (
              <span className="flex items-center gap-1">
                <span className="text-blue-600">💧</span>
                Nước: {formatPrice(room.water_price)}/m³
              </span>
            )}
          </div>
        )}

        <div className={cn(
          "text-xl font-bold",
          highlighted ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600" : "text-primary"
        )}>
          {formatPrice(room.price)}/tháng
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize component để tránh re-render khi Swiper slide
export default memo(RoomCard, (prevProps, nextProps) => {
  // Chỉ re-render khi room.id thay đổi
  return prevProps.room.id === nextProps.room.id && prevProps.highlighted === nextProps.highlighted
})
