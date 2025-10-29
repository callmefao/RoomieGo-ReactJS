"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreVertical, CheckCircle, XCircle, Eye, Clock, MapPin, DollarSign } from "lucide-react"
import RoomsService from "@/lib/rooms-service"
import RoomDetailDialog from "@/components/admin/PendingRoomDetailDialog"
import { useErrorOverlay } from "@/components/ErrorOverlayProvider"
import type { PendingRoom } from "@/types/room"

export default function PendingRooms() {
  const [rooms, setRooms] = useState<PendingRoom[]>([])
  const [filteredRooms, setFilteredRooms] = useState<PendingRoom[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<PendingRoom | null>(null)
  const { toast } = useToast()
  const { showError } = useErrorOverlay()

  const fetchPendingRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { rooms: pendingRooms } = await RoomsService.getPendingRooms()
      setRooms(pendingRooms)
      setFilteredRooms(pendingRooms)
    } catch (err: any) {
      console.error("Error fetching pending rooms:", err)
      const message = err?.message || "Không thể tải danh sách phòng chờ duyệt"
      setError(message)
      showError(message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchPendingRooms()
  }, [fetchPendingRooms])

  // Filter rooms based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = rooms.filter((room) => {
      const ownerName = getOwnerName(room)
      const address = room.location || ""

      return (
        room.title?.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        ownerName.toLowerCase().includes(query)
      )
    })
    setFilteredRooms(filtered)
  }, [searchQuery, rooms])

  const handleApprove = useCallback(async (roomId: number) => {
    try {
      await RoomsService.approvePendingRoom(roomId)

      // Refresh the list
      await fetchPendingRooms()
      toast({
        title: "Đã duyệt phòng",
        description: "Phòng đã được chuyển sang danh sách hoạt động.",
      })
    } catch (err: any) {
      console.error("Error approving room:", err)
      showError(err?.message || "Duyệt phòng thất bại, vui lòng thử lại sau.")
    }
  }, [fetchPendingRooms, showError, toast])

  const handleReject = useCallback(async (roomId: number) => {
    try {
      await RoomsService.rejectPendingRoom(roomId)

      // Refresh the list
      await fetchPendingRooms()
      toast({
        title: "Đã từ chối phòng",
        description: "Phòng đã được chuyển về trạng thái nháp.",
      })
    } catch (err: any) {
      console.error("Error rejecting room:", err)
      showError(err?.message || "Không thể từ chối phòng, vui lòng thử lại sau.")
    }
  }, [fetchPendingRooms, showError, toast])

  const handleViewDetails = (room: PendingRoom) => {
    setSelectedRoomId(room.id)
    setSelectedRoom(room)
    setDetailOpen(true)
  }

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Chưa cập nhật"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }, [])

  const getOwnerName = useCallback((room: PendingRoom) => {
    return room.owner_name || room.owner?.username || room.owner_username || ""
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phòng chờ duyệt</CardTitle>
          <CardDescription>Đang tải danh sách phòng từ hệ thống...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phòng chờ duyệt</CardTitle>
          <CardDescription>Không thể tải danh sách phòng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPendingRooms}>Thử lại</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Phòng chờ duyệt</CardTitle>
            <CardDescription>
              Kiểm tra hồ sơ và phê duyệt phòng của chủ trọ ({filteredRooms.length} phòng đang chờ)
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {filteredRooms.length} phòng
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tiêu đề, địa chỉ hoặc chủ phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pending Rooms List */}
  {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Hiện không có phòng nào cần duyệt</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Room Image */}
                    <div className="w-full md:w-48 h-48 md:h-auto bg-muted relative">
                      {(room.main_image_url || RoomsService.getRoomOptimizedImage(room)) ? (
                        <img
                          src={room.main_image_url || RoomsService.getRoomOptimizedImage(room)}
                          alt={room.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                  {/* Room Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{room.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{room.location}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleApprove(room.id)}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Duyệt phòng
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(room.id)}>
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Từ chối
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-primary">{RoomsService.formatPrice(room.price)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Diện tích: {room.area}m²</div>
                      {getOwnerName(room) ? (
                        <div className="text-sm text-muted-foreground">
                          Chủ phòng: {getOwnerName(room)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Ngày gửi: {formatDate(room.submitted_at || room.created_at)}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleReject(room.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(room.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Duyệt
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(room)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <RoomDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        roomId={selectedRoomId}
        fallbackRoom={selectedRoom || undefined}
        onAfterUpload={fetchPendingRooms}
        context="pending"
      />
    </Card>
  )
}
