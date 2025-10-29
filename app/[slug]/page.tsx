"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Footer from "@/components/Footer"
import PanoramaViewer from "@/components/PanoramaViewer"
import RentalLocationMap from "@/components/RentalLocationMap"
import RecommendedRooms from "@/components/RecommendedRooms"
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
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Layers,
  Info,
} from "lucide-react"
import Image from "next/image"
import type { Room, RoomImage } from "@/types/room"
import {
  formatAmenities,
  groupImagesByType,
  getImageTypeDisplayName,
  getMainImageUrl,
  formatPrice,
  validateCoordinates,
  parseCoordinates,
  getRoomStatusDisplay,
} from "@/utils/room-helpers"

interface PageProps {
  params: {
    slug: string
  }
}

interface InfoRow {
  key: string
  icon: JSX.Element
  label: string
  value: string
  containerClassName?: string
  onClick?: () => void
}

async function fetchRoom(slug: string): Promise<Room | null> {
  try {
    // Extract ID from slug (assuming slug format: "title-id")
    const parts = slug.split("-")
    const id = parts[parts.length - 1]

    if (!id || isNaN(Number(id))) {
      return null
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
    const response = await fetch(`${baseUrl}/api/rooms/${id}/`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const room = await response.json()
    return room
  } catch (error) {
    console.error("Error fetching room:", error)
    return null
  }
}

export default function RoomDetailPage({ params }: PageProps) {
  const { slug } = params

  if (!slug || ["auth", "admin", "rental-listings"].includes(slug)) {
    notFound()
  }

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
    const has360 = Boolean(groupedImages["360"]?.length)
    setHas360Images(has360)

    const fallbackCategory = groupedImages[selectedImageCategory]?.length
      ? selectedImageCategory
      : groupedImages["main"]?.length
        ? "main"
        : Object.keys(groupedImages).find((key) => groupedImages[key]?.length) || "main"

    if (fallbackCategory !== selectedImageCategory) {
      setSelectedImageCategory(fallbackCategory)
      setCurrentImages(groupedImages[fallbackCategory] || [])
      setSelectedImageIndex(0)
      return
    }

    setCurrentImages(groupedImages[fallbackCategory] || [])
    setSelectedImageIndex(0)
  }, [room, selectedImageCategory])

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isImageViewerOpen) return

      switch (e.key) {
        case "Escape":
          closeImageViewer()
          break
        case "ArrowLeft":
          prevImage()
          break
        case "ArrowRight":
          nextImage()
          break
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isImageViewerOpen])

  const openImageViewer = (index: number, category: string = selectedImageCategory) => {
    if (!room) return
    const groupedImages = groupImagesByType(room.images || [])
    const images = groupedImages[category] || []
    setSelectedImageCategory(category)
    setCurrentImages(images)
    setSelectedImageIndex(index)
    setIsImageViewerOpen(true)
  }

  const closeImageViewer = () => {
    setIsImageViewerOpen(false)
  }

  const nextImage = () => {
    if (!currentImages.length) return
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
  }

  const prevImage = () => {
    if (!currentImages.length) return
    setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
  }

  const open360View = () => {
    setIs360ViewOpen(true)
  }

  const close360View = () => {
    setIs360ViewOpen(false)
  }

  useEffect(() => {
    if (isImageViewerOpen) return
    if (currentImages.length <= 1) return

    const timer = window.setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [currentImages, isImageViewerOpen])

  if (loading) {
    return (
      <div className="space-y-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-1/3 rounded bg-muted"></div>
          <div className="h-64 rounded bg-muted"></div>
          <div className="h-32 rounded bg-muted"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!room) {
    notFound()
  }

  const groupedImages = groupImagesByType(room.images || [])
  const mainImageUrl = getMainImageUrl(room)
  const amenities = formatAmenities(room.amenities_detail ?? room.amenities)
  const statusDisplay = getRoomStatusDisplay(room.status)
  const contactPhone = room.contact_phone?.trim()
  const galleryCategories = Object.entries(groupedImages)
    .filter(([type, images]) => type !== "360" && images.length > 0)
    .sort((a, b) => {
      if (a[0] === "main") return -1
      if (b[0] === "main") return 1
      return a[0].localeCompare(b[0])
    })
  const displayedImage =
    currentImages[selectedImageIndex]?.optimized_url ||
    currentImages[selectedImageIndex]?.original_url ||
    mainImageUrl ||
    "/placeholder.jpg"
  const publishedAt = room.created_at ? new Date(room.created_at).toLocaleDateString("vi-VN") : null

  const monthlyCostRow: InfoRow = {
    key: "monthly",
    // icon: <Banknote className="h-5 w-5 text-primary" />,
    label: "Tiền trọ hàng tháng",
    // TODO: tái kích hoạt tổng chi phí khi API cung cấp `total_monthly_cost`
    value: `${formatPrice(room.price)}/tháng`,
  }

  const costRows: InfoRow[] = []

  const depositValue = room.deposit != null ? formatPrice(room.deposit) : "Không có tiền cọc"
  costRows.push({
    key: "deposit",
    icon: <Banknote className="h-4 w-4 text-primary" />,
    label: "Đặt cọc",
    value: depositValue,
  })

  const electricityValue =
    room.electricity_price != null ? `${formatPrice(room.electricity_price)}/số` : "Thương lượng"
  costRows.push({
    key: "electricity",
    icon: <Zap className="h-4 w-4 text-primary" />,
    label: "Tiền điện",
    value: electricityValue,
  })

  const waterValue = room.water_price != null ? `${formatPrice(room.water_price)}/khối` : "Thương lượng"
  costRows.push({
    key: "water",
    icon: <Droplets className="h-4 w-4 text-primary" />,
    label: "Tiền nước",
    value: waterValue,
  })

  if (room.internet_price != null) {
    costRows.push({
      key: "internet",
      icon: <Wifi className="h-4 w-4 text-primary" />,
      label: "Internet",
      value: `${formatPrice(room.internet_price)}/tháng`,
    })
  }

  if (room.parking_price != null) {
    costRows.push({
      key: "parking",
      icon: <Car className="h-4 w-4 text-primary" />,
      label: "Đậu xe",
      value: `${formatPrice(room.parking_price)}/tháng`,
    })
  }

  const handleOpenGoogleMaps = () => {
    const hasValidCoordinates = validateCoordinates(room.latitude, room.longitude)
    if (hasValidCoordinates) {
      const coords = parseCoordinates(room.latitude!, room.longitude!)
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, "_blank")
      return
    }

    if (room.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.location)}`, "_blank")
    }
  }

  const otherInfoRows: InfoRow[] = [
    {
      key: "address",
      icon: <MapPin className="h-4 w-4 text-primary" />,
      label: "Địa chỉ",
      value: room.location,
      containerClassName: "sm:col-span-2 cursor-pointer transition hover:border-primary/40 hover:bg-primary/10",
      onClick: handleOpenGoogleMaps,
    },
    {
      key: "area",
      icon: <Square className="h-4 w-4 text-primary" />,
      label: "Diện tích",
      value: `${room.area} m²`,
    },
  ]

  if (room.contact_hours) {
    otherInfoRows.push({
      key: "contact-hours",
      icon: <Clock className="h-4 w-4 text-primary" />,
      label: "Giờ liên hệ",
      value: room.contact_hours,
    })
  }

  if (room.has_mezzanine) {
    otherInfoRows.push({
      key: "mezzanine",
      icon: <Layers className="h-4 w-4 text-primary" />,
      label: "Gác lửng",
      value: "Có gác lửng",
    })
  }

  const ruleExtras: Array<{ label: string; value: string }> = []

  if (room.max_people) {
    ruleExtras.push({
      label: "Số người tối đa",
      value: `${room.max_people} người`,
    })
  }

  if (room.minimum_stay_months) {
    ruleExtras.push({
      label: "Thuê tối thiểu",
      value: `${room.minimum_stay_months} tháng`,
    })
  }

  const hasRuleContent = Boolean(room.house_rules) || ruleExtras.length > 0

  return (
    <>
      <div className="space-y-10 pb-16">
        {/* Top summary section */}
        <section className="rounded-2xl border border-border bg-background/80 shadow-sm">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {room.is_featured && <Badge className="bg-amber-100 text-amber-800">Nổi bật</Badge>}
                <Badge variant="outline" className={`border-transparent ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </Badge>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {room.view_count ?? 0} lượt xem
                </span>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{room.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {room.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    {room.area} m²
                  </span>
                  {room.has_mezzanine && (
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Có gác lửng
                    </span>
                  )}
                  {room.max_people && (
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Tối đa {room.max_people} người
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-2xl bg-muted/40 p-6 md:items-end">
              <div className="text-3xl font-bold text-red-600 md:text-4xl">
                {formatPrice(room.price)}/tháng
              </div>
              <Button
                size="lg"
                className="w-full md:w-auto"
                disabled={!contactPhone}
                onClick={() => contactPhone && window.open(`tel:${contactPhone}`, "_self")}
              >
                <Phone className="h-4 w-4" />
                <span>Liên hệ ngay</span>
              </Button>
              {publishedAt && <span className="text-xs text-muted-foreground">Đăng ngày {publishedAt}</span>}
            </div>
          </div>
        </section>

        {/* Main layout: gallery + room info */}
        <section className="grid gap-8 lg:grid-cols-[2fr_1.1fr]">
          <div className="space-y-4">
            <div
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted"
              onClick={() => openImageViewer(selectedImageIndex, selectedImageCategory)}
            >
              <Image
                src={displayedImage}
                alt={`${getImageTypeDisplayName(selectedImageCategory)} - ${room.title}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {currentImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white shadow transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    onClick={(event) => {
                      event.stopPropagation()
                      prevImage()
                    }}
                    aria-label="Xem ảnh trước"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white shadow transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    onClick={(event) => {
                      event.stopPropagation()
                      nextImage()
                    }}
                    aria-label="Xem ảnh tiếp theo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              {room.is_featured && (
                <Badge className="absolute left-4 top-4 bg-amber-100 text-amber-900">Nổi bật</Badge>
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="rounded-full border border-white/40 bg-white/10 p-3 backdrop-blur">
                  <ZoomIn className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {galleryCategories.map(([type, images]) => (
                <Button
                  key={type}
                  variant={selectedImageCategory === type ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setSelectedImageCategory(type)}
                >
                  {getImageTypeDisplayName(type)} ({images.length})
                </Button>
              ))}
              {has360Images && (
                <Button
                  variant="default"
                  size="sm"
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  onClick={open360View}
                >
                  🌐 Xem 360°
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
              {currentImages.map((image, index) => {
                const thumbnail = image.optimized_url || image.original_url
                return (
                  <button
                    type="button"
                    key={`${thumbnail}-${index}`}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      index === selectedImageIndex
                        ? "border-primary shadow-lg"
                        : "border-transparent hover:border-primary/50 hover:shadow"
                    }`}
                    onClick={() => {
                      setSelectedImageIndex(index)
                      openImageViewer(index)
                    }}
                  >
                    <Image src={thumbnail || "/placeholder.jpg"} alt={`Ảnh ${index + 1}`} fill className="object-cover" />
                  </button>
                )
              })}
              {currentImages.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
                  Chưa có hình ảnh cho danh mục này
                </div>
              )}
            </div>
          </div>

          <Card className="h-full rounded-2xl border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-primary">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Info className="h-5 w-5" />
                </span>
                Thông tin phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              {monthlyCostRow && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <span className="inline-flex items-center gap-2 text-base font-semibold text-primary">
                        {monthlyCostRow.icon}
                        {monthlyCostRow.label}
                      </span>
                      <span className="text-2xl font-bold text-red-600 md:text-3xl">{monthlyCostRow.value}</span>
                    </div>
                  </div>
                </div>
              )}

              {costRows.length > 0 && (
                <div className="space-y-3 border-t border-dashed border-border/60 pt-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-primary">Các chi phí khác</h3>
                    <div className="flex-1 h-px bg-primary/20" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {costRows.map((item) => (
                      <div
                        key={item.key}
                        className="flex h-full flex-col justify-between rounded-2xl border border-primary/20 bg-muted/10 p-4"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="text-base font-semibold text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherInfoRows.length > 0 && (
                <div className="space-y-3 border-t border-dashed border-border/60 pt-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-primary">Thông tin khác</h3>
                    <div className="flex-1 h-px bg-primary/20" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {otherInfoRows.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3 ${item.containerClassName ?? ""}`}
                        onClick={item.onClick}
                        role={item.onClick ? "button" : undefined}
                        tabIndex={item.onClick ? 0 : undefined}
                        onKeyDown={(event) => {
                          if (!item.onClick) return
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            item.onClick?.()
                          }
                        }}
                      >
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {room.description && (
                <div className="space-y-3 border-t border-dashed border-border/60 pt-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-primary">Mô tả</h3>
                    <div className="flex-1 h-px bg-primary/20" />
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{room.description}</p>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="space-y-3 border-t border-dashed border-border/60 pt-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-primary">Tiện ích đi kèm</h3>
                    <div className="flex-1 h-px bg-primary/20" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {amenities.map((amenity, index) => (
                      <div
                        key={amenity.id ?? amenity.slug ?? `${amenity.name}-${index}`}
                        className="flex items-center gap-3 rounded-xl bg-muted/20 px-4 py-3"
                      >
                        {amenity.icon_url ? (
                          <Image
                            src={amenity.icon_url}
                            alt={amenity.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-primary/60" />
                        )}
                        <span className="text-sm font-medium text-foreground">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 border-t border-dashed border-border/60 pt-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-primary">Thông tin liên hệ</h3>
                  <div className="flex-1 h-px bg-primary/20" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">SDT:</span>
                    <span className="text-muted-foreground">{contactPhone ?? "Đang cập nhật"}</span>
                  </div>
                  {room.owner_username && (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Chủ nhà:</span>
                      <span className="text-muted-foreground">{room.owner_username}</span>
                    </div>
                  )}
                </div>
              </div>

              {hasRuleContent && (
                <div className="space-y-3 border-t border-dashed border-border/60 pt-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-primary">Nội quy</h3>
                    <div className="flex-1 h-px bg-primary/20" />
                  </div>
                  {room.house_rules && (
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{room.house_rules}</p>
                  )}
                  {ruleExtras.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ruleExtras.map((rule) => (
                        <div
                          key={rule.label}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                        >
                          <span className="font-medium text-foreground">{rule.label}</span>
                          <span className="text-sm text-muted-foreground">{rule.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Footer map section */}
        <Card className="rounded-2xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Vị trí</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Hiển thị bản đồ khi có tọa độ hợp lệ */}
            {validateCoordinates(room.latitude, room.longitude) ? (
              <RentalLocationMap
                location={parseCoordinates(room.latitude!, room.longitude!)}
                address={room.location}
                rentalName={room.title}
              />
            ) : (
              <div className="space-y-2 rounded-xl border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                <MapPin className="mx-auto h-8 w-8 opacity-50" />
                <p>Chưa có thông tin vị trí chính xác</p>
                <p className="text-xs">Địa chỉ: {room.location}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Image Viewer Modal */}
      {isImageViewerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 z-[10000] h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={closeImageViewer}
          >
            <X className="h-8 w-8" />
          </Button>

          {currentImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 top-1/2 z-[10000] h-16 w-16 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-1/2 z-[10000] h-16 w-16 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-10 w-10" />
              </Button>
            </>
          )}

          <div className="relative flex h-full max-h-[90vh] w-full max-w-7xl items-center justify-center">
            <div className="relative h-full w-full">
              <Image
                src={
                  currentImages[selectedImageIndex]?.optimized_url ||
                  currentImages[selectedImageIndex]?.original_url ||
                  "/placeholder.jpg"
                }
                alt={`${getImageTypeDisplayName(selectedImageCategory)} ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4">
            <div className="rounded-full bg-black/70 px-4 py-2 text-lg font-medium text-white backdrop-blur-sm">
              {selectedImageIndex + 1} / {currentImages.length}
            </div>
            <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {getImageTypeDisplayName(selectedImageCategory)}
            </div>
          </div>

          {currentImages.length > 1 && (
            <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm">
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                    index === selectedImageIndex
                      ? "border-white scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image src={image.optimized_url || image.original_url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="absolute top-6 left-6 text-sm text-white/70">
            <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
              ← → điều hướng • ESC đóng
            </div>
          </div>
        </div>
      )}

      {/* PanoramaViewer Component */}
      {has360Images && (
        <PanoramaViewer
          isOpen={is360ViewOpen}
          onClose={close360View}
          src={
            groupedImages["360"][0]
              ? groupedImages["360"][0].optimized_url || groupedImages["360"][0].original_url
              : "/placeholder.jpg"
          }
          title={`${room.title} - Xem 360°`}
        />
      )}

  {/* Các phòng đề xuất / recommend */}
  <RecommendedRooms currentRoomId={room.id} title="Các phòng nổi bật khác" limit={4} />

  <Footer />
    </>
  )
}
