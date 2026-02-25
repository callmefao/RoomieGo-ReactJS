"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, Plus, Edit, Trash2, Eye } from "lucide-react"
import { findRoomieService } from "@/lib/findroomie-service"
import { mapApiResponseToRoomie } from "@/lib/utils/findroomie-mapper"
import type { Roomie } from "@/types/roomie"
import RoomieCard from "@/components/RoomieCard"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function MyPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Roomie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchMyPosts()
  }, [])

  const fetchMyPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await findRoomieService.getMyPosts()
      const mappedPosts = response.results.map(mapApiResponseToRoomie)
      setPosts(mappedPosts)
      console.log(`✅ Fetched ${mappedPosts.length} my posts`)
    } catch (err: any) {
      console.error('❌ Error fetching my posts:', err)
      if (err.status === 401) {
        // Unauthorized - redirect to login
        router.push('/auth')
      } else {
        setError('Không thể tải danh sách bài đăng. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await findRoomieService.deleteRoommate(deleteId)
      console.log(`✅ Deleted post #${deleteId}`)
      
      // Remove from list
      setPosts(prev => prev.filter(p => p.id !== deleteId))
      setDeleteId(null)
    } catch (err: any) {
      console.error('❌ Error deleting post:', err)
      alert('Không thể xóa bài đăng. Vui lòng thử lại.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ProtectedRoute requireAuth={true}>
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/find-roomie")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">Bài đăng của tôi</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý bài đăng tìm bạn ở ghép của bạn
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Đang tải bài đăng...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-foreground">Đã có lỗi xảy ra</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchMyPosts} variant="outline">
              Thử lại
            </Button>
          </div>
        </Card>
      ) : posts.length > 0 ? (
        <div className="max-w-2xl mx-auto">
          {/* Single Post Display */}
          <div className="relative group">
            <RoomieCard roomie={posts[0]} />
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/find-roomie/${posts[0].id}`)}
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/find-roomie/edit/${posts[0].id}`)}
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setDeleteId(posts[0].id)}
              >
                <Trash2 className="h-4 w-4" />
                Xóa bài đăng
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-foreground">Chưa có bài đăng nào</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Bạn chưa đăng bài tìm bạn ở ghép nào. Hãy tạo bài đăng để tìm người bạn ở ghép phù hợp!
            </p>
            <Button
              onClick={() => router.push("/find-roomie/create")}
              size="lg"
              className="gap-2 mt-4 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700"
            >
              <Plus className="h-5 w-5" />
              Tạo bài đăng
            </Button>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài đăng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ProtectedRoute>
  )
}
