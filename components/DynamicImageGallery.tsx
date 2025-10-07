"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"

interface DynamicImageGalleryProps {
  rentalId: string
  category: "parking" | "360-view" | "rooms" | "entrance"
  onImageClick: (index: number) => void
}

export default function DynamicImageGallery({ 
  rentalId, 
  category, 
  onImageClick 
}: DynamicImageGalleryProps) {
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    const loadImages = async () => {
      const images: string[] = []
      const maxImages = 20 // Try up to 20 images per category
      
      // Generate potential image paths
      for (let i = 1; i <= maxImages; i++) {
        const categoryFolder = category === 'rooms' ? 'rooms' : 
                              category === '360-view' ? '360-view' : category
        const imageName = category === 'rooms' ? `room-${i}.jpg` :
                         category === '360-view' ? `360-view-${i}.jpg` :
                         category === 'parking' ? `parking-${i}.jpg` :
                         `entrance-${i}.jpg`
        
        const imagePath = `/rental-images/${rentalId}/${categoryFolder}/${imageName}`
        
        // Try to load the image to check if it exists
        try {
          const response = await fetch(imagePath, { method: 'HEAD' })
          if (response.ok) {
            images.push(imagePath)
          } else {
            break // Stop trying when we hit a 404
          }
        } catch (error) {
          break // Stop on any error
        }
      }
      
      setAvailableImages(images)
      setLoadedCount(images.length)
    }

    loadImages()
  }, [rentalId, category])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {availableImages.map((image, index) => (
        <div 
          key={index} 
          className="aspect-square relative rounded-xl overflow-hidden bg-muted group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
          onClick={() => onImageClick(index)}
        >
          <Image
            src={image}
            alt={`${category} ${index + 1}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1}
          </div>
        </div>
      ))}
      
      {availableImages.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          Chưa có hình ảnh cho danh mục này
        </div>
      )}
    </div>
  )
}