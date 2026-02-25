"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function EditRoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params?.id as string

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
          <h1 className="text-3xl font-bold text-foreground">Chỉnh sửa phòng trọ</h1>
          <p className="text-muted-foreground mt-2">
            Cập nhật thông tin phòng #{roomId}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-lg font-medium text-yellow-800">🚧 Đang phát triển</p>
            <p className="text-sm text-yellow-700 mt-2">
              Tính năng chỉnh sửa phòng trọ sẽ được hoàn thiện trong phiên bản tiếp theo
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
