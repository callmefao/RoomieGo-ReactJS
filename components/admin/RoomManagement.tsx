"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layers, MapPin, Eye, Search } from "lucide-react"
import RoomsService from "@/lib/rooms-service"
import type { Room } from "@/types/room"
import RoomDetailDialog from "@/components/admin/PendingRoomDetailDialog"
import { useErrorOverlay } from "@/components/ErrorOverlayProvider"
import { formatAmenities } from "@/utils/room-helpers"

type PriceFilter = "all" | "low" | "medium" | "high"

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const { showError } = useErrorOverlay()

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      const response = await RoomsService.getRooms(undefined, { includeAuth: true })
      const roomList: Room[] = Array.isArray(response) ? response : response?.results ?? []
      const normalizedRooms = roomList.map((room) => ({
        ...room,
        images: room.images ?? [],
      })) as Room[]
      setRooms(normalizedRooms)
    } catch (error: any) {
      const message = error?.message || "Không thể tải danh sách phòng"
      console.error("Error fetching rooms:", error)
      showError(message)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return rooms.filter((room) => {
      const roomTitle = room.title?.toLowerCase() ?? ""
      const location = room.location?.toLowerCase() ?? ""
      const matchesSearch = !query || roomTitle.includes(query) || location.includes(query)

      const priceValue = Number(room.price) || 0
      let matchesPrice = true
      if (priceFilter === "low") {
        matchesPrice = priceValue < 2_000_000
      } else if (priceFilter === "medium") {
        matchesPrice = priceValue >= 2_000_000 && priceValue < 2_500_000
      } else if (priceFilter === "high") {
        matchesPrice = priceValue >= 2_500_000
      }

      return matchesSearch && matchesPrice
    })
  }, [rooms, searchQuery, priceFilter])

  const handleViewDetails = useCallback((room: Room) => {
    const fallbackRoom = { ...room, images: room.images ?? [] } as Room
    setSelectedRoomId(room.id)
    setSelectedRoom(fallbackRoom)
    setDetailOpen(true)
  }, [])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      setSelectedRoomId(null)
      setSelectedRoom(null)
    }
  }, [])

  const resolveCoverImage = useCallback((room: Room) => {
    const mainImage = RoomsService.getRoomMainImage(room)
    return RoomsService.getValidImageUrl(mainImage)
  }, [])

  const isLoading = loading
  const totalRooms = rooms.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý phòng</CardTitle>
        <CardDescription>Theo dõi và cập nhật thông tin các phòng đang hoạt động</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tiêu đề hoặc địa chỉ..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={priceFilter} onValueChange={(value) => setPriceFilter(value as PriceFilter)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Mức giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giá</SelectItem>
              <SelectItem value="low">Dưới 2 triệu</SelectItem>
              <SelectItem value="medium">2 - 2.5 triệu</SelectItem>
              <SelectItem value="high">Trên 2.5 triệu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Diện tích</TableHead>
                <TableHead>Tiện ích</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Đang tải danh sách phòng...
                  </TableCell>
                </TableRow>
              ) : filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy phòng phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => {
                  const imageUrl = resolveCoverImage(room)
                  const showFallback = !imageUrl || imageUrl === "/placeholder.jpg"
                  const amenities = formatAmenities(room.amenities_detail ?? room.amenities)

                  return (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 overflow-hidden rounded-md bg-muted">
                            {showFallback ? (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Eye className="h-5 w-5" />
                              </div>
                            ) : (
                              <Image
                                src={imageUrl}
                                alt={room.title || "Ảnh phòng"}
                                fill
                                sizes="(max-width: 768px) 80px, 120px"
                                className="object-cover"
                                unoptimized
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{room.title}</div>
                            {room.has_mezzanine && (
                              <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                                <Layers className="h-3 w-3" />
                                Gác lửng
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">Mã phòng: {room.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{room.location || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {RoomsService.formatPrice(Number(room.price) || 0)}
                      </TableCell>
                      <TableCell>{room.area ? `${room.area}m²` : "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {amenities.slice(0, 2).map((amenity, index) => (
                            <Badge
                              key={amenity.id ?? amenity.slug ?? `${amenity.name}-${index}`}
                              variant="secondary"
                              className="flex items-center gap-1 text-xs"
                            >
                              {amenity.icon_url ? (
                                <img
                                  src={amenity.icon_url}
                                  alt={amenity.name}
                                  className="h-4 w-4"
                                />
                              ) : null}
                              {amenity.name}
                            </Badge>
                          ))}
                          {amenities.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{amenities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(room)}>
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Đang hiển thị {filteredRooms.length}/{totalRooms} phòng
        </div>
      </CardContent>
      <RoomDetailDialog
        open={detailOpen}
        onOpenChange={handleDialogOpenChange}
        roomId={selectedRoomId}
        fallbackRoom={selectedRoom || undefined}
        onAfterUpload={fetchRooms}
        context="active"
      />
    </Card>
  )
}
