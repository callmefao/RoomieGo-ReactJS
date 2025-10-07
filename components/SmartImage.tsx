/**
 * Simple Image Component
 * ======================
 * 
 * Simple component để hiển thị images từ backend API
 * Backend sẽ trả về URL có sẵn (signed hoặc public URL)
 */

'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface SimpleImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  onLoad?: () => void
  onError?: (error: any) => void
}

export default function SimpleImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.jpg',
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  onLoad,
  onError
}: SimpleImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleImageError = (e: any) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
    } else {
      setHasError(true)
      setIsLoading(false)
    }
    onError?.(e)
  }

  // Next.js Image component props
  const imageProps: any = {
    src: currentSrc,
    alt,
    className,
    onLoad: handleImageLoad,
    onError: handleImageError,
    priority,
  }

  if (fill) {
    imageProps.fill = true
    if (sizes) imageProps.sizes = sizes
  } else if (width && height) {
    imageProps.width = width
    imageProps.height = height
  }

  return (
    <div className="relative">
      <Image {...imageProps} />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized component for room images
export function RoomImage({
  room,
  className,
  ...props
}: Omit<SimpleImageProps, 'src'> & {
  room: { main_image_url?: string }
}) {
  return (
    <SimpleImage
      src={room.main_image_url || '/placeholder.jpg'}
      className={className}
      {...props}
    />
  )
}