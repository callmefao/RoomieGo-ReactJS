"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Sparkles, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Room } from "@/types/room"
import { generateRentalSlug } from "@/lib/utils/url"
import { cn } from "@/lib/utils"

interface RoomCardProps {
  room: Room
  highlighted?: boolean
}

export default function RoomCard({ room, highlighted = false }: RoomCardProps) {
  const router = useRouter()

  const getMainImage = (room: Room): string => {
    // Debug log
    console.log(`🖼️ Getting image for room ${room.id}:`, {
      main_image_url: room.main_image_url,
      images_count: room.images?.length || 0,
      first_image: room.images?.[0]
    })
    
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
        <img
          src={getMainImage(room)}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            console.log(`❌ Image load failed for room ${room.id}, using placeholder`)
            e.currentTarget.src = "/placeholder.svg"
          }}
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

        <div className="flex items-center text-muted-foreground mb-3">
          <Square className="h-4 w-4 mr-1" />
          <span className="text-sm">{room.area}m²</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {room.amenities?.slice(0, 2).map((amenity, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {(room.amenities?.length || 0) > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{(room.amenities?.length || 0) - 2}
            </Badge>
          )}
        </div>

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
