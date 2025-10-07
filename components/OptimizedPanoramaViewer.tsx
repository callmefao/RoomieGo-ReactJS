"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Maximize, Minimize, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimizedPanoramaViewerProps {
  src: string
  alt?: string
  className?: string
  showControls?: boolean
  lazy?: boolean
}

export default function OptimizedPanoramaViewer({ 
  src, 
  alt = "360° Panoramic View", 
  className,
  showControls = true,
  lazy = true
}: OptimizedPanoramaViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerRef, setViewerRef] = useState<any>(null)

  // Memoize viewer options for performance
  const viewerOptions = useMemo(() => ({
    autorotateSpeed: '0.5rpm',
    defaultZoomLvl: 50,
    minFov: 30,
    maxFov: 90,
    mouseWheelCtrlKey: false,
    mousemove: true,
    keyboard: {
      ArrowUp: 'rotateLatitudeUp',
      ArrowDown: 'rotateLatitudeDown', 
      ArrowRight: 'rotateLongitudeRight',
      ArrowLeft: 'rotateLongitudeLeft',
      PageUp: 'zoomIn',
      PageDown: 'zoomOut',
      Plus: 'zoomIn',
      Minus: 'zoomOut',
    }
  }), [])

  const handleReady = useCallback((instance: any) => {
    setViewerRef(instance)
    setIsLoaded(true)
    setError(null)
  }, [])

  const handleError = useCallback((err: any) => {
    console.error('360° Viewer Error:', err)
    setError('Không thể tải hình ảnh 360°')
    setIsLoaded(false)
  }, [])

  // Control functions
  const zoomIn = useCallback(() => {
    viewerRef?.zoom(viewerRef.getZoomLevel() + 10)
  }, [viewerRef])

  const zoomOut = useCallback(() => {
    viewerRef?.zoom(viewerRef.getZoomLevel() - 10)
  }, [viewerRef])

  const resetView = useCallback(() => {
    viewerRef?.animate({
      longitude: 0,
      latitude: 0,
      zoom: 50
    })
  }, [viewerRef])

  const PanoramaContent = () => (
    <div className="relative">
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center h-96 bg-muted text-muted-foreground">
          <p>{error}</p>
        </div>
      ) : (
        <ReactPhotoSphereViewer
          src={src}
          height={isFullscreen ? "100vh" : "400px"}
          width="100%"
          onReady={handleReady}
          containerClass={cn(
            "rounded-lg overflow-hidden",
            className
          )}
        />
      )}

      {/* Control buttons */}
      {showControls && isLoaded && !error && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={zoomIn}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={zoomOut}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetView}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Fullscreen toggle */}
      {isLoaded && !error && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )

  if (lazy) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-32 border-dashed border-2 hover:border-primary"
          >
            <div className="text-center">
              <Maximize className="h-6 w-6 mx-auto mb-2" />
              <span>Xem 360°</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <PanoramaContent />
        </DialogContent>
      </Dialog>
    )
  }

  return <PanoramaContent />
}