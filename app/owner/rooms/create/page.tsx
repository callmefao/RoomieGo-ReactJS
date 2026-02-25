"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function CreateRoomPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["owner"]}>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/owner/rooms")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Đăng phòng trọ mới</h1>
          <p className="text-muted-foreground mt-2">
            Tạo bài đăng phòng trọ của bạn
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-lg font-medium text-yellow-800">🚧 Đang phát triển</p>
            <p className="text-sm text-yellow-700 mt-2">
              Tính năng đăng phòng trọ sẽ được hoàn thiện trong phiên bản tiếp theo
            </p>
            <Button
              onClick={() => router.push("/owner/rooms")}
              className="mt-4"
              variant="outline"
            >
              Quay lại danh sách phòng
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
