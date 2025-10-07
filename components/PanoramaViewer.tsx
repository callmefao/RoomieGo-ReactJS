"use client"

import React from "react"
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { checkPanoramaImage } from "@/utils/panorama-helper"

/**
 * PanoramaViewer Component
 * Sử dụng react-photo-sphere-viewer để hiển thị ảnh panorama 360°
 * 
 * @param {string} src - URL của ảnh panorama 360°
 * @param {boolean} isOpen - Trạng thái mở/đóng viewer
 * @param {function} onClose - Callback khi đóng viewer
 * @param {string} title - Tiêu đề hiển thị
 */

interface PanoramaViewerProps {
  src: string
  isOpen: boolean
  onClose: () => void
  title?: string
}

export default function PanoramaViewer({ 
  src, 
  isOpen, 
  onClose, 
  title = "Panorama 360°" 
}: PanoramaViewerProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorDetails, setErrorDetails] = useState<string[]>([])

  // Kiểm tra format ảnh hỗ trợ
  const getSupportedImageSrc = (originalSrc: string) => {
    // Chỉ chấp nhận JPEG/JPG cho panorama, tránh PNG
    const supportedFormats = ['.jpg', '.jpeg', '.JPG', '.JPEG']
    const hasValidFormat = supportedFormats.some(format => originalSrc.toLowerCase().includes(format))
    
    if (!hasValidFormat) {
      console.warn('Panorama: Format ảnh không được khuyến nghị. Nên dùng JPEG/JPG')
    }
    
    return originalSrc || "/placeholder.svg"
  }

  const handleReady = () => {
    console.log('Panorama viewer ready!')
    setIsLoading(false)
    setHasError(false)
  }

  // Effect để kiểm tra ảnh khi mở - LUÔN chạy, không conditional
  useEffect(() => {
    if (isOpen && src) {
      setIsLoading(true)
      setHasError(false)
      setErrorDetails([])
      
      // Sử dụng utility helper để kiểm tra ảnh
      checkPanoramaImage(src).then((result) => {
        if (!result.isValid) {
          setHasError(true)
          setErrorDetails(result.recommendations)
        }
        setIsLoading(false)
        
        // Log thông tin debug
        console.log('Panorama check result:', result)
      }).catch((error) => {
        console.error('Error checking panorama:', error)
        setHasError(true)
        setErrorDetails(['Lỗi không xác định khi kiểm tra ảnh'])
        setIsLoading(false)
      })
    } else if (!isOpen) {
      // Reset state khi đóng
      setHasError(false)
      setIsLoading(true)
      setErrorDetails([])
    }
  }, [isOpen, src])

  // Render conditional AFTER all hooks
  if (!isOpen) return null

  if (hasError) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <h2 className="text-2xl mb-4">Không thể tải ảnh 360°</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>Chi tiết lỗi:</p>
            <ul className="list-disc list-inside space-y-1">
              {errorDetails.length > 0 ? (
                errorDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))
              ) : (
                <>
                  <li>Kích thước ảnh quá lớn (khuyến nghị &lt; 4K)</li>
                  <li>Format không hỗ trợ (chỉ hỗ trợ JPEG/JPG)</li>
                  <li>File không tồn tại hoặc đường dẫn sai</li>
                  <li>Ảnh không phải panorama 360°</li>
                </>
              )}
            </ul>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Src: {src}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black">
      {/* Header với title và nút đóng */}
      <div className="absolute top-4 left-4 right-4 z-[10001] flex justify-between items-center">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-[10000]">
          <div className="text-white text-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            Đang tải ảnh 360°...
          </div>
        </div>
      )}

      {/* ReactPhotoSphereViewer - Component chính */}
      <ReactPhotoSphereViewer
        src={getSupportedImageSrc(src)}
        height="100vh"
        width="100vw"
        
        // Cấu hình navbar (thanh điều khiển)
        navbar={[
          'zoom',      // Nút zoom in/out
          'move',      // Nút di chuyển
          'download',  // Nút tải xuống
          'fullscreen' // Nút toàn màn hình
        ]}
        
        // Góc nhìn mặc định
        defaultYaw={0}     // Góc ngang (0° = chính giữa)
        defaultPitch={0}   // Góc dọc (0° = ngang mắt)
        
        // Giới hạn zoom
        minFov={30}        // Zoom in tối đa (30° = gần nhất)
        maxFov={90}        // Zoom out tối đa (90° = xa nhất)
        
        // Cấu hình điều khiển
        mousemove={true}           // Cho phép di chuyển bằng chuột
        mousewheelCtrlKey={false}  // Zoom bằng scroll (không cần Ctrl)
        touchmoveTwoFingers={true} // Di chuyển bằng 2 ngón tay trên mobile
        
        // Tùy chọn khác
        caption={title}            // Chú thích hiển thị
        loadingTxt="Đang tải..."   // Text khi loading
        
        // Event handlers chỉ onReady
        onReady={handleReady}
      />

      {/* Debug info */}
      <div className="absolute bottom-4 left-4 text-white/50 text-xs">
        <div className="bg-black/50 px-2 py-1 rounded">
          {src.split('/').pop()} | {isLoading ? 'Loading...' : 'Ready'}
        </div>
      </div>
    </div>
  )
}