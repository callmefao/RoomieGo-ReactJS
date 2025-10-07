"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

interface RoomImage {
  original_url: string
  optimized_url: string
  image_type: string
  order: number
  image_format: string
}

interface Image360GalleryProps {
  images: RoomImage[]
}

export default function Image360Gallery({ images }: Image360GalleryProps) {
  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Eye className="h-5 w-5" />
          Xem 360°
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative w-full h-[300px] rounded-lg overflow-hidden">
              <Image
                src={image.original_url}
                alt={`Ảnh 360° ${index + 1}`}
                fill
                className="object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleImageClick(image.original_url)}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Badge className="bg-blue-600 text-white">
                  360°
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}