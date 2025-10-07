"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
}

export default function ImageWithFallback({
  src,
  alt,
  className,
  fill = false,
  onLoad,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isError, setIsError] = useState(false)

  const handleError = () => {
    setIsError(true)
    setImgSrc("/placeholder.svg")
    onError?.()
  }

  const handleLoad = () => {
    setIsError(false)
    onLoad?.()
  }

  useEffect(() => {
    setImgSrc(src)
    setIsError(false)
  }, [src])

  if (isError) {
    return null // Don't render if image doesn't exist
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      fill={fill}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  )
}