"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PanoramaViewer from "@/components/PanoramaViewer"
import RentalLocationMap from "@/components/RentalLocationMap"
import { 
  MapPin, 
  Users, 
  Square, 
  Calendar,
  Phone,
  Clock,
  Wifi,
  Car,
  Zap,
  Droplets,
  Banknote,
  Home,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Maximize
} from "lucide-react"
import Image from "next/image"
import { Room, RoomImage } from "@/types/room"
import { 
  formatAmenities, 
  groupImagesByType, 
  getImageTypeDisplayName, 
  getMainImageUrl, 
  formatPrice,
  validateCoordinates,
  parseCoordinates 
} from "@/utils/room-helpers"

interface PageProps {
  params: {
    slug: string
  }
}

async function fetchRoom(slug: string): Promise<Room | null> {
  try {
    // Extract ID from slug (assuming slug format: "title-id")
    const parts = slug.split('-')
    const id = parts[parts.length - 1]
    
    if (!id || isNaN(Number(id))) {
      return null
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    const response = await fetch(`${baseUrl}/api/rooms/${id}/`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const room = await response.json()
    return room
  } catch (error) {
    console.error('Error fetching room:', error)
    return null
  }
}

export default function RoomDetailPage({ params }: PageProps) {
  const { slug } = params
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [is360ViewOpen, setIs360ViewOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState<RoomImage[]>([])
  const [selectedImageCategory, setSelectedImageCategory] = useState<string>("main")
  const [has360Images, setHas360Images] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRoom() {
      const roomData = await fetchRoom(slug)
      if (!roomData) {
        notFound()
      }
      setRoom(roomData)
      setLoading(false)
    }
    loadRoom()
  }, [slug])

  useEffect(() => {
    if (!room) return
    const groupedImages = groupImagesByType(room.images || [])
    const has360 = groupedImages['360'] && groupedImages['360'].length > 0
    setHas360Images(has360)
    
    // Set initial images based on selected category
    const categoryImages = groupedImages[selectedImageCategory] || []
    setCurrentImages(categoryImages)
  }, [room, selectedImageCategory])

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isImageViewerOpen) return

      switch (e.key) {
        case 'Escape':
          closeImageViewer()
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isImageViewerOpen])

  const openImageViewer = (index: number, category: string = selectedImageCategory) => {
    if (!room) return
    const groupedImages = groupImagesByType(room.images || [])
    setCurrentImages(groupedImages[category] || [])
    setSelectedImageIndex(index)
    setIsImageViewerOpen(true)
  }

  const closeImageViewer = () => {
    setIsImageViewerOpen(false)
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
  }

  const open360View = () => {
    setIs360ViewOpen(true)
  }

  const close360View = () => {
    setIs360ViewOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!room) {
    notFound()
  }

  const groupedImages = groupImagesByType(room.images || [])
  const mainImageUrl = getMainImageUrl(room)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{room.title}</h1>
            <div className="text-3xl font-bold text-primary mb-4">{formatPrice(room.price)}/tháng</div>
          </div>

          {/* Main Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Main Image */}
                <div className="w-full md:w-80 h-80 relative rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer group"
                     onClick={() => openImageViewer(0, 'main')}>
                  <Image
                    src={mainImageUrl}
                    alt={room.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  {room.is_featured && (
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-900">
                      Nổi bật
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                      <ZoomIn className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Room details */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{room.location}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Square className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{room.area}m²</span>
                    </div>

                    {room.max_people && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Tối đa {room.max_people} người</span>
                      </div>
                    )}

                    {room.minimum_stay_months && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Thuê tối thiểu {room.minimum_stay_months} tháng</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {room.view_count} lượt xem
                      </span>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <div className="pt-4">
                    <Button className="w-full md:w-auto" size="lg">
                      <Phone className="w-4 h-4 mr-2" />
                      Liên hệ: {room.contact_phone}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Category tabs - Bỏ category 360, chỉ giữ nút xem 360° riêng */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(groupedImages)
                  .filter(([type]) => type !== 'main' && type !== '360') // Bỏ 360 khỏi tabs
                  .map(([type, images]) => (
                    <Button
                      key={type}
                      variant={selectedImageCategory === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedImageCategory(type)}
                    >
                      {getImageTypeDisplayName(type)} ({images.length})
                    </Button>
                  ))}
                
                {/* Nút 360° View riêng biệt */}
                {has360Images && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    onClick={open360View}
                  >
                    🌐 Xem 360°
                  </Button>
                )}
              </div>

              {/* Image grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square relative rounded-xl overflow-hidden bg-muted group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => openImageViewer(index)}
                  >
                    <Image
                      src={image.optimized_url || image.original_url}
                      alt={`${getImageTypeDisplayName(selectedImageCategory)} ${index + 1}`}
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
              </div>

              {currentImages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có hình ảnh cho danh mục này
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {room.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tiện ích</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formatAmenities(room.amenities).map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-5 h-5 bg-primary rounded-full flex-shrink-0" />
                      <span className="font-medium text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Costs */}
          {(room.deposit || room.electricity_price || room.water_price || room.internet_price || room.parking_price) && (
            <Card>
              <CardHeader>
                <CardTitle>Chi phí khác</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {room.deposit && (
                    <div className="flex justify-between items-center py-2">
                      <span className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Đặt cọc
                      </span>
                      <span className="font-semibold">{formatPrice(room.deposit)}</span>
                    </div>
                  )}
                  {room.electricity_price && (
                    <div className="flex justify-between items-center py-2">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Tiền điện
                      </span>
                      <span className="font-semibold">{formatPrice(room.electricity_price)}/số</span>
                    </div>
                  )}
                  {room.water_price && (
                    <div className="flex justify-between items-center py-2">
                      <span className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Tiền nước
                      </span>
                      <span className="font-semibold">{formatPrice(room.water_price)}/khối</span>
                    </div>
                  )}
                  {room.internet_price && (
                    <div className="flex justify-between items-center py-2">
                      <span className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        Internet
                      </span>
                      <span className="font-semibold">{formatPrice(room.internet_price)}/tháng</span>
                    </div>
                  )}
                  {room.parking_price && (
                    <div className="flex justify-between items-center py-2">
                      <span className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Đậu xe
                      </span>
                      <span className="font-semibold">{formatPrice(room.parking_price)}/tháng</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-medium">SDT:</span>
                  <span className="text-foreground">{room.contact_phone}</span>
                </div>
                {room.contact_hours && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">Giờ liên hệ:</span>
                    <span className="text-foreground">{room.contact_hours}</span>
                  </div>
                )}
                {room.owner_username && (
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">Chủ nhà:</span>
                    <span className="text-foreground">{room.owner_username}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* House Rules */}
          {room.house_rules && (
            <Card>
              <CardHeader>
                <CardTitle>Nội quy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {room.house_rules}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {room.view_count} lượt xem
                </span>
                <span>
                  Đăng {room.created_at ? new Date(room.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bản đồ vị trí */}
          <Card>
            <CardHeader>
              <CardTitle>Vị trí</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 
                RentalLocationMap Component
                - Sử dụng Leaflet (OpenStreetMap) để hiển thị bản đồ
                - Hiển thị marker tại vị trí phòng trọ
                - Có popup với thông tin chi tiết
                - Click marker để mở Google Maps
                - Circle highlight khu vực xung quanh
                - Buttons để mở Google Maps và chỉ đường
                - Responsive và tối ưu cho mobile
                
                Props cần thiết:
                - location: { lat: number, lng: number } - Tọa độ GPS từ API
                - address: string - Địa chỉ chi tiết  
                - rentalName: string - Tên phòng trọ
                
                Dữ liệu thực từ API:
                - latitude: "10.02990000" (string)
                - longitude: "105.76840000" (string)
                - Cần convert sang number và validate
              */}
              {validateCoordinates(room.latitude, room.longitude) ? (
                <RentalLocationMap
                  location={parseCoordinates(room.latitude!, room.longitude!)}
                  address={room.location}
                  rentalName={room.title}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có thông tin vị trí chính xác</p>
                  <p className="text-xs mt-1">Địa chỉ: {room.location}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Screen Image Viewer Modal */}
        {isImageViewerOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-[10000] text-white hover:bg-white/20 h-12 w-12 rounded-full"
              onClick={closeImageViewer}
            >
              <X className="h-8 w-8" />
            </Button>

            {/* Navigation buttons */}
            {currentImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 z-[10000] text-white hover:bg-white/20 h-16 w-16 rounded-full bg-black/30"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-10 w-10" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 z-[10000] text-white hover:bg-white/20 h-16 w-16 rounded-full bg-black/30"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-10 w-10" />
                </Button>
              </>
            )}

            {/* Main Image Container */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={currentImages[selectedImageIndex]?.optimized_url || currentImages[selectedImageIndex]?.original_url || "/placeholder.jpg"}
                  alt={`${getImageTypeDisplayName(selectedImageCategory)} ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={100}
                  priority
                />
              </div>
            </div>

            {/* Bottom UI */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              {/* Image counter */}
              <div className="bg-black/70 text-white px-4 py-2 rounded-full text-lg font-medium backdrop-blur-sm">
                {selectedImageIndex + 1} / {currentImages.length}
              </div>
              
              {/* Category label */}
              <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {getImageTypeDisplayName(selectedImageCategory)}
              </div>
            </div>

            {/* Thumbnail strip for navigation */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto py-2 px-4 bg-black/50 rounded-full backdrop-blur-sm">
                {currentImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      index === selectedImageIndex ? 'border-white scale-110' : 'border-transparent hover:border-white/50'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.optimized_url || image.original_url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Keyboard instructions */}
            <div className="absolute top-6 left-6 text-white/70 text-sm">
              <div className="bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                <p>← → điều hướng • ESC đóng</p>
              </div>
            </div>
          </div>
        )}

        {/* PanoramaViewer Component */}
        {has360Images && (
          <PanoramaViewer
            isOpen={is360ViewOpen}
            onClose={close360View}
            src={groupedImages['360'][0] ? (groupedImages['360'][0].optimized_url || groupedImages['360'][0].original_url) : "/placeholder.jpg"}
            title={`${room.title} - Xem 360°`}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}