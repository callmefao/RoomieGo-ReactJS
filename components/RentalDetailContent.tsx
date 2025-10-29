"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { Phone, MessageCircle, MapPin, Wifi, Snowflake, Shirt, Star, Send, X, ChevronLeft, ChevronRight, Maximize, RotateCcw, ZoomIn } from "lucide-react"
import RentalLocationMap from "./RentalLocationMap"
import DynamicImageGallery from "./DynamicImageGallery"
import PanoramaViewer from "./PanoramaViewer"
import { formatAmenities } from "@/utils/room-helpers"
import type { RoomAmenityDetail } from "@/types/room"

interface RentalData {
  id: string
  name: string
  price: string
  address: string
  description: string
  amenities?: string[]
  amenities_detail?: RoomAmenityDetail[]
  contact: {
    phone: string
    zalo: string
  }
  images: {
    parking: string[]
    roomPhotos: string[]
    entrance: string[]
  }
  location: {
    lat: number
    lng: number
  }
}

interface RentalDetailContentProps {
  rental: RentalData
}

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
}

const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Nguyễn Văn A",
    rating: 5,
    comment: "Phòng trọ rất tốt, sạch sẽ và đầy đủ tiện nghi. Chủ trọ thân thiện, hỗ trợ nhiệt tình.",
    date: "2024-01-15",
  },
  {
    id: "2",
    userName: "Trần Thị B",
    rating: 4,
    comment: "Vị trí thuận lợi, gần trường học. Giá cả hợp lý, môi trường an toàn.",
    date: "2024-01-10",
  },
  {
    id: "3",
    userName: "Lê Văn C",
    rating: 5,
    comment: "Wifi nhanh, máy lạnh mát. Rất hài lòng với chất lượng phòng trọ.",
    date: "2024-01-05",
  },
]

export default function RentalDetailContent({ rental }: RentalDetailContentProps) {
  const [selectedImageCategory, setSelectedImageCategory] = useState<"parking" | "roomPhotos" | "entrance">("roomPhotos")
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "highest">("newest")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [is360ViewOpen, setIs360ViewOpen] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [has360Image, setHas360Image] = useState(false)

  // Check if 360 image exists
  useEffect(() => {
    const check360Image = async () => {
      try {
        const imagePath = `/rental-images/${rental.id}/360-view/360-view-1.jpg`
        const response = await fetch(imagePath, { method: 'HEAD' })
        setHas360Image(response.ok)
      } catch {
        setHas360Image(false)
      }
    }
    
    check360Image()
  }, [rental.id])

  // Load images dynamically based on available files
  useEffect(() => {
    const loadAvailableImages = async () => {
      const images: string[] = []
      const maxImages = 20
      
      const categoryMap = {
        parking: 'parking',
        roomPhotos: 'rooms',
        entrance: 'entrance'
      }
      
      const nameMap = {
        parking: 'parking',
        roomPhotos: 'room', 
        entrance: 'entrance'
      }
      
      const categoryFolder = categoryMap[selectedImageCategory]
      const imageName = nameMap[selectedImageCategory]
      
      for (let i = 1; i <= maxImages; i++) {
        const imagePath = `/rental-images/${rental.id}/${categoryFolder}/${imageName}-${i}.jpg`
        
        try {
          const response = await fetch(imagePath, { method: 'HEAD' })
          if (response.ok) {
            images.push(imagePath)
          } else {
            break
          }
        } catch {
          break
        }
      }
      
      setCurrentImages(images)
      if (selectedImageIndex >= images.length) {
        setSelectedImageIndex(0)
      }
    }

    loadAvailableImages()
  }, [selectedImageCategory, rental.id])

  const amenities = useMemo(
    () => formatAmenities(rental.amenities_detail ?? rental.amenities),
    [rental.amenities_detail, rental.amenities],
  )

  const amenityIcons: Record<string, JSX.Element> = {
    "Máy lạnh": <Snowflake className="h-5 w-5" />,
    "air_conditioner": <Snowflake className="h-5 w-5" />,
    "Máy giặt": <Shirt className="h-5 w-5" />,
    washer: <Shirt className="h-5 w-5" />,
    "Wifi riêng": <Wifi className="h-5 w-5" />,
    wifi: <Wifi className="h-5 w-5" />,
  }

  const handleContact = () => {
    window.open(`tel:${rental.contact.phone}`, "_self")
  }

  const openImageViewer = (index: number) => {
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
  }, [isImageViewerOpen, selectedImageCategory])

  const handleSubmitReview = () => {
    if (newRating === 0 || newComment.trim() === "") return

    const newReview: Review = {
      id: Date.now().toString(),
      userName: "Người dùng ẩn danh",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split("T")[0],
    }

    setReviews([newReview, ...reviews])
    setNewRating(0)
    setNewComment("")
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else {
      return b.rating - a.rating
    }
  })

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Chi tiết trọ</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Square placeholder image */}
            <div className="w-full md:w-80 h-80 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={rental.images.roomPhotos[0] || "/placeholder.svg"}
                alt={rental.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Rental details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{rental.name}</h2>
                <div className="text-3xl font-bold text-primary mb-4">{rental.price}</div>
                <div className="flex items-start space-x-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{rental.address}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mô tả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{rental.description}</p>
            <p className="text-foreground leading-relaxed mt-4">
              <strong>Đặc điểm nổi bật:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground">
              <li>Vị trí thuận lợi, gần trung tâm thành phố</li>
              <li>An ninh tốt, có camera giám sát 24/7</li>
              <li>Môi trường sống sạch sẽ, yên tĩnh</li>
              <li>Gần các tiện ích: chợ, trường học, bệnh viện</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiện nghi</CardTitle>
        </CardHeader>
        <CardContent>
          {amenities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {amenities.map((amenity, index) => {
                const iconKey = amenity.slug ?? amenity.name
                const fallbackIcon = amenityIcons[iconKey] || amenityIcons[amenity.name]

                return (
                  <div
                    key={amenity.id ?? amenity.slug ?? `${amenity.name}-${index}`}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="text-primary">
                      {amenity.icon_url ? (
                        <Image
                          src={amenity.icon_url}
                          alt={amenity.name}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          unoptimized
                        />
                      ) : (
                        fallbackIcon ?? <div className="h-5 w-5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">{amenity.name}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa cập nhật danh sách tiện nghi.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">SDT:</span>
              <span className="text-foreground">{rental.contact.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Zalo:</span>
              <span className="text-foreground">{rental.contact.zalo}</span>
            </div>
            <Button
              onClick={handleContact}
              className="bg-muted-foreground hover:bg-muted-foreground/90 text-background mt-4"
            >
              Liên hệ ngay
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Always show these 3 tabs */}
            <Button
              variant={selectedImageCategory === "roomPhotos" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedImageCategory("roomPhotos")}
            >
              Ảnh phòng
            </Button>
            <Button
              variant={selectedImageCategory === "entrance" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedImageCategory("entrance")}
            >
              Đường vào
            </Button>
            <Button
              variant={selectedImageCategory === "parking" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedImageCategory("parking")}
            >
              Chỗ đậu xe
            </Button>
            
            {/* Only show 360 tab if image exists */}
            {has360Image && (
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setIs360ViewOpen(true)}
              >
                🌐 Ảnh 360 độ
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
                  src={image || "/placeholder.svg"}
                  alt={`${selectedImageCategory} ${index + 1}`}
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
            <div className="text-center py-8 text-muted-foreground">Chưa có hình ảnh cho danh mục này</div>
          )}
        </CardContent>
      </Card>

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
                src={currentImages[selectedImageIndex] || "/placeholder.svg"}
                alt={`${selectedImageCategory} ${selectedImageIndex + 1}`}
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
              {selectedImageCategory === 'parking' && 'Chỗ đậu xe'}
              {selectedImageCategory === 'roomPhotos' && 'Ảnh phòng'}
              {selectedImageCategory === 'entrance' && 'Đường vào'}
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
                    src={image}
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
      <PanoramaViewer
        isOpen={is360ViewOpen}
        onClose={close360View}
        src={`/rental-images/${rental.id}/360-view/360-view-1.jpg`}
        title={`${rental.name} - Xem 360°`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Vị trí</CardTitle>
        </CardHeader>
        <CardContent>
          <RentalLocationMap
            location={rental.location}
            address={rental.address}
            rentalName={rental.name}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Đánh giá & Bình luận</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-muted-foreground">
                  ({averageRating.toFixed(1)} - {reviews.length} đánh giá)
                </span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Review Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Để lại đánh giá của bạn</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Đánh giá sao:</label>
              {renderStars(newRating, true, setNewRating)}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bình luận:</label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={newRating === 0 || newComment.trim() === ""}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Gửi đánh giá</span>
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-foreground">Sắp xếp theo:</span>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === "newest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("newest")}
              >
                Mới nhất
              </Button>
              <Button
                variant={sortBy === "highest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("highest")}
              >
                Đánh giá cao nhất
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {review.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{review.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="text-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
