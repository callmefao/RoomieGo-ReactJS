"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Room } from "@/lib/chatbot-service"
import { formatPrice, formatUtilityPrice, generateRoomUrl } from "@/lib/utils/chatbot-helpers"

interface RoomCardProps {
  room: Room
  number?: number
  onViewDetails?: (url: string) => void
  compact?: boolean
  className?: string
}

export function RoomCard({ 
  room, 
  number,
  onViewDetails, 
  compact = false,
  className 
}: RoomCardProps) {
  const roomUrl = generateRoomUrl(room)

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(roomUrl)
    }
  }

  return (
    <Card className={cn(
      "bg-white border-2 border-blue-100 hover:border-blue-300 shadow-md hover:shadow-lg transition-all overflow-hidden",
      compact && "max-w-sm",
      className
    )}>
      <CardContent className="p-0">
        {/* Image Section - PRIORITY FIELD */}
        {room.main_image_url && (
          <div className="relative w-full h-40 bg-gradient-to-br from-blue-50 to-cyan-50">
            <Image 
              src={room.main_image_url}
              alt={room.title}
              fill
              className="object-cover"
              unoptimized
            />
            {number && (
              <div className="absolute top-2 left-2 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold shadow-md">
                {number}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title - PRIORITY FIELD */}
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight">
            {room.title}
          </h3>

          {/* Price Section - PRIORITY FIELDS: price, water_price, electricity_price */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-lg font-bold text-blue-700">
                  {formatPrice(room.price)}/tháng
                </div>
                <div className="text-xs text-gray-600 mt-0.5 space-x-3">
                  <span>⚡ {formatUtilityPrice(room.electricity_price, 'đ/kWh')}</span>
                  <span>💧 {formatUtilityPrice(room.water_price, 'đ/m³')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location - PRIORITY FIELD */}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-base">📍</span>
            <span className="flex-1 line-clamp-2">{room.location}</span>
          </div>

          {/* Secondary Info */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              📐 {room.area}m²
            </Badge>
            {room.has_mezzanine && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                🏠 Có gác
              </Badge>
            )}
            {room.distance_km && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                📏 {room.distance_km.toFixed(1)}km
              </Badge>
            )}
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="text-xs text-gray-600">
              ✨ {room.amenities.slice(0, 3).join(', ')}
              {room.amenities.length > 3 && '...'}
            </div>
          )}

          {/* View Details Button */}
          <Button 
            onClick={handleViewDetails}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
