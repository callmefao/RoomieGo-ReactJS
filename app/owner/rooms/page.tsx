"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Home, Clock, CheckCircle, XCircle, Edit, Trash2, Eye } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import Image from "next/image"
import { RoomsService } from "@/lib/rooms-service"
import type { Room } from "@/types/room"

export default function OwnerRoomsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyRooms()
  }, [])

  const fetchMyRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await RoomsService.getMyRooms()
      console.log('🔍 API Response:', response)
      
      // Handle both array and object with results property
      const roomsData = Array.isArray(response) ? response : (response as any).results || []
      setRooms(roomsData)
      console.log(`✅ Fetched ${roomsData.length} rooms from owner`)
    } catch (err: any) {
      console.error('❌ Error fetching owner rooms:', err)
      if (err.status === 401) {
        router.push('/auth')
      } else {
        setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return
    
    try {
      await RoomsService.deleteRoom(roomId)
      setRooms(prev => prev.filter(r => r.id !== roomId))
      console.log(`✅ Deleted room #${roomId}`)
    } catch (err: any) {
      console.error('❌ Error deleting room:', err)
      alert('Không thể xóa phòng. Vui lòng thử lại.')
    }
  }

  const filteredRooms = rooms.filter(room => {
    if (activeTab === "all") return true
    if (activeTab === "approved") return room.status === 1 // approved
    if (activeTab === "pending") return room.status === 0 // pending
    if (activeTab === "rejected") return room.status === 2 // rejected
    return true
  })

  const stats = {
    total: rooms.length,
    approved: rooms.filter(r => r.status === 1).length,
    pending: rooms.filter(r => r.status === 0).length,
    rejected: rooms.filter(r => r.status === 2).length
  }

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        Đã duyệt
      </span>
    } else if (status === 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="h-3 w-3" />
        Chờ duyệt
      </span>
    } else if (status === 2) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="h-3 w-3" />
        Từ chối
      </span>
    }
    return null
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["owner"]}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quản lý phòng trọ</h1>
              <p className="text-muted-foreground mt-2">
                Quản lý các phòng trọ của bạn
              </p>
            </div>
            <Button
              onClick={() => router.push("/owner/rooms/create")}
              size="lg"
              className="gap-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700"
            >
              <Plus className="h-5 w-5" />
              Đăng phòng mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng số phòng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Từ chối
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Rooms List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Tất cả</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Đã duyệt</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Chờ duyệt</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Từ chối</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  Đang tải...
                </div>
              </Card>
            ) : error ? (
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-semibold text-foreground">Đã có lỗi xảy ra</h3>
                  <p className="text-muted-foreground">{error}</p>
                  <Button onClick={fetchMyRooms} variant="outline">
                    Thử lại
                  </Button>
                </div>
              </Card>
            ) : filteredRooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-slate-200">
                      {room.main_image_url ? (
                        <Image
                          src={room.main_image_url}
                          alt={room.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Chưa có ảnh
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(room.status)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {room.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        📍 {room.address}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-blue-600">
                          {room.price.toLocaleString('vi-VN')} đ/tháng
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {room.area}m²
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push(`/${room.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push(`/owner/rooms/edit/${room.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {activeTab === "all" ? "Chưa có phòng trọ nào" : `Không có phòng ${activeTab === "approved" ? "đã duyệt" : activeTab === "pending" ? "chờ duyệt" : "bị từ chối"}`}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {activeTab === "all" 
                      ? "Bạn chưa đăng phòng trọ nào. Hãy đăng phòng đầu tiên để bắt đầu!"
                      : "Thay đổi tab để xem các phòng khác."
                    }
                  </p>
                  {activeTab === "all" && (
                    <Button
                      onClick={() => router.push("/owner/rooms/create")}
                      size="lg"
                      className="gap-2 mt-4 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"
                    >
                      <Plus className="h-5 w-5" />
                      Đăng phòng đầu tiên
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
