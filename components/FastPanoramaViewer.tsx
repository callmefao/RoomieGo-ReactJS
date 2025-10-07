"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer'
import { Button } from '@/components/ui/button'
import { X, Loader2, Wifi, WifiOff } from 'lucide-react'
import { PanoramaImageOptimizer, ConnectionDetector } from '@/lib/panorama-optimizer'

interface FastPanoramaViewerProps {
  src: string
  isOpen: boolean
  onClose: () => void
  title?: string
}

export default function FastPanoramaViewer({ 
  src, 
  isOpen, 
  onClose, 
  title = "Panorama 360°" 
}: FastPanoramaViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [quality, setQuality] = useState<'thumbnail' | 'medium' | 'high' | 'original'>('thumbnail')
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'medium' | 'slow'>('medium')
  const [error, setError] = useState<string | null>(null)

  // Detect connection speed
  useEffect(() => {
    setConnectionSpeed(ConnectionDetector.getConnectionSpeed())
  }, [])

  // Progressive image loading
  useEffect(() => {
    if (!isOpen || !src) return

    const loadPanorama = async () => {
      setIsLoading(true)
      setError(null)
      setLoadingProgress(0)

      try {
        // Generate responsive URLs
        const urls = PanoramaImageOptimizer.generateResponsiveUrls(src)
        
        // Check cache first
        const cached = PanoramaImageOptimizer.getCached(src)
        if (cached) {
          setImageUrl(cached)
          setQuality('high')
          setIsLoading(false)
          return
        }

        // Progressive loading based on connection
        if (ConnectionDetector.shouldUseProgressiveLoading()) {
          // Step 1: Load thumbnail immediately (fast preview)
          setLoadingProgress(25)
          const thumbImg = new Image()
          thumbImg.onload = () => {
            setImageUrl(urls.thumbnail)
            setQuality('thumbnail')
            setLoadingProgress(50)
          }
          thumbImg.src = urls.thumbnail

          // Step 2: Load appropriate quality in background
          setTimeout(async () => {
            try {
              setLoadingProgress(75)
              const result = await PanoramaImageOptimizer.loadProgressive(urls)
              setImageUrl(result.url)
              setQuality(result.quality as any)
              setLoadingProgress(100)
              
              // Cache the result
              PanoramaImageOptimizer.setCached(src, result.url)
            } catch (err) {
              console.warn('Progressive loading failed:', err)
              setImageUrl(urls.original)
              setQuality('original')
            }
            setIsLoading(false)
          }, 100)
        } else {
          // Fast connection: Load high quality directly
          const highImg = new Image()
          highImg.onload = () => {
            setImageUrl(urls.high)
            setQuality('high')
            setIsLoading(false)
            setLoadingProgress(100)
            PanoramaImageOptimizer.setCached(src, urls.high)
          }
          highImg.onerror = () => {
            // Fallback to original
            setImageUrl(urls.original)
            setQuality('original')
            setIsLoading(false)
          }
          highImg.src = urls.high
        }

      } catch (err) {
        console.error('Panorama loading error:', err)
        setError('Không thể tải ảnh panorama')
        setIsLoading(false)
      }
    }

    loadPanorama()
  }, [isOpen, src])

  // Memoize viewer configuration for performance
  const viewerConfig = useMemo(() => ({
    navbar: ['zoom', 'move', 'fullscreen'],
    defaultYaw: 0,
    defaultPitch: 0,
    minFov: 30,
    maxFov: 90,
    mousemove: true,
    mousewheelCtrlKey: false,
    touchmoveTwoFingers: true,
    loadingTxt: "Đang tải...",
    // Performance optimizations
    useXmpData: false, // Skip XMP metadata parsing
    fisheye: false,    // Disable fisheye correction (faster)
    moveSpeed: 1.0,    // Smooth movement
    zoomSpeed: 1.0,    // Smooth zoom
  }), [])

  const handleClose = useCallback(() => {
    onClose()
    // Reset states when closing
    setImageUrl(null)
    setIsLoading(true)
    setLoadingProgress(0)
    setError(null)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] bg-black">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-[10001] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          
          {/* Connection & Quality indicators */}
          <div className="flex items-center gap-2 text-sm text-white/70">
            {connectionSpeed === 'fast' ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : connectionSpeed === 'medium' ? (
              <Wifi className="h-4 w-4 text-yellow-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="capitalize">{quality}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[10001] bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg mb-2">Đang tải panorama...</p>
            <div className="w-64 bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-sm text-white/70">{loadingProgress}% - {connectionSpeed} connection</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-[10001] bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-lg mb-4">{error}</p>
            <Button onClick={handleClose} variant="outline">
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* Panorama viewer */}
      {imageUrl && !error && (
        <ReactPhotoSphereViewer
          src={imageUrl}
          height="100vh"
          width="100vw"
          {...viewerConfig}
          onReady={() => {
            setIsLoading(false)
          }}
        />
      )}

      {/* Performance info (development only) */}
      {process.env.NODE_ENV === 'development' && imageUrl && (
        <div className="absolute bottom-4 left-4 text-white/50 text-xs">
          Speed: {connectionSpeed} | Quality: {quality} | URL: {imageUrl.split('/').pop()}
        </div>
      )}
    </div>
  )
}