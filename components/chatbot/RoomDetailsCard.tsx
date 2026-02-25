"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Star, 
  Home, 
  Maximize2, 
  Sparkles, 
  Phone,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Room } from "@/lib/chatbot-service"
import { formatPrice, formatUtilityPrice, generateRoomUrl } from "@/lib/utils/chatbot-helpers"

interface RoomDetailsCardProps {
  room: Room
  onViewFullPage?: (url: string) => void
  onViewImages?: (url: string) => void
  onFindSimilar?: (roomId: string) => void
  className?: string
}

export function RoomDetailsCard({ 
  room,
  onViewFullPage,
  onViewImages,
  onFindSimilar,
  className 
}: RoomDetailsCardProps) {
  const roomUrl = generateRoomUrl(room)

  return (
    <Card className={cn(
      "bg-gradient-to-br from-blue-50 via-cyan-50/50 to-teal-50/30 border-2 border-blue-200/50 shadow-lg overflow-hidden",
      className
    )}>
      {/* Header with Image */}
      {room.main_image_url && (
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
          <Image 
            src={room.main_image_url}
            alt={room.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <CardHeader className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <span className="text-2xl">🏡</span>
          <div className="flex-1">
            <div className="font-bold">{room.title}</div>
            <div className="text-sm font-normal text-cyan-100 mt-0.5">
              ID: {room.id}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-3">
        {/* PRIORITY: Price Information */}
        <div className="bg-gradient-to-r from-blue-100/80 to-cyan-100/80 rounded-lg p-4 border border-blue-200">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl">💰</span>
            <div className="text-2xl font-bold text-blue-700">
              {formatPrice(room.price)}<span className="text-base font-normal text-gray-600">/tháng</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-700">
              <span>⚡ Điện:</span>
              <span className="font-semibold">{formatUtilityPrice(room.electricity_price, 'đ/kWh')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span>💧 Nước:</span>
              <span className="font-semibold">{formatUtilityPrice(room.water_price, 'đ/m³')}</span>
            </div>
          </div>
        </div>

        {/* PRIORITY: Location */}
        <InfoRow 
          icon={<MapPin className="h-5 w-5 text-cyan-600" />}
          label="Địa chỉ" 
          value={room.location}
          highlight
        />

        {/* Other Details */}
        <div className="grid gap-3">
          <InfoRow 
            icon={<Maximize2 className="h-5 w-5" />}
            label="Diện tích" 
            value={`${room.area}m²`}
          />

          {room.has_mezzanine !== null && (
            <InfoRow 
              icon={<Home className="h-5 w-5" />}
              label="Gác lửng" 
              value={room.has_mezzanine ? "Có" : "Không"}
              badge={room.has_mezzanine}
            />
          )}

          {room.amenities && room.amenities.length > 0 && (
            <InfoRow 
              icon={<Sparkles className="h-5 w-5 text-amber-500" />}
              label="Tiện ích" 
              value={room.amenities.join(', ')}
            />
          )}

          {room.district && (
            <InfoRow 
              icon={<MapPin className="h-5 w-5 text-gray-500" />}
              label="Quận/Huyện" 
              value={room.district}
            />
          )}

          {room.distance_km && (
            <InfoRow 
              icon={<span className="text-lg">📏</span>}
              label="Khoảng cách" 
              value={`${room.distance_km.toFixed(1)}km`}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-3 border-t border-blue-200/50">
          {/* Primary Action */}
          {onViewFullPage && (
            <Button 
              onClick={() => onViewFullPage(roomUrl)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all font-semibold"
              size="default"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Xem chi tiết đầy đủ
            </Button>
          )}

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            {onViewImages && room.image_360_url && (
              <Button 
                onClick={() => onViewImages(roomUrl)}
                variant="outline"
                className="flex-1 border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-medium"
                size="sm"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Xem ảnh 360°
              </Button>
            )}

            {onFindSimilar && (
              <Button 
                onClick={() => onFindSimilar(room.id)}
                variant="outline"
                className="flex-1 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 font-medium"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Phòng tương tự
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ================= INFO ROW COMPONENT =================

interface InfoRowProps {
  emoji?: string
  icon?: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  badge?: boolean
}

function InfoRow({ emoji, icon, label, value, highlight, badge }: InfoRowProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-all",
      highlight 
        ? "bg-gradient-to-r from-blue-100/80 to-cyan-100/80 border border-blue-200"
        : "bg-white/60 border border-gray-200/50 hover:bg-white/80"
    )}>
      {/* Icon/Emoji */}
      <div className="flex-shrink-0 mt-0.5">
        {emoji ? (
          <span className="text-xl">{emoji}</span>
        ) : (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-0.5">
          {label}
        </div>
        <div className={cn(
          "font-medium break-words",
          highlight ? "text-blue-700 text-base" : "text-foreground text-sm"
        )}>
          {badge ? (
            <Badge 
              variant={value === "Có" ? "default" : "secondary"}
              className="text-xs"
            >
              {value}
            </Badge>
          ) : (
            <span>{value}</span>
          )}
        </div>
      </div>
    </div>
  )
}
