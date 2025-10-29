"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useErrorOverlay } from "@/components/ErrorOverlayProvider"
import RoomsService from "@/lib/rooms-service"
import type { Room, RoomImage } from "@/types/room"
import { formatAmenities } from "@/utils/room-helpers"

type ImageTypeOption = RoomImage["image_type"]

type RoomDetailDialogContext = "pending" | "active"

interface RoomDetailDialogProps {
  roomId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAfterUpload?: () => void
  fallbackRoom?: Partial<Room>
  context?: RoomDetailDialogContext
}

const imageTypeLabels: Record<ImageTypeOption, string> = {
  main: "Ảnh chính",
  interior: "Ảnh nội thất",
  exterior: "Ảnh ngoại cảnh",
  bathroom: "Ảnh nhà vệ sinh",
  kitchen: "Ảnh bếp",
  parking: "Ảnh bãi đỗ",
  laundry: "Ảnh giặt phơi",
  "360": "Ảnh 360 độ",
  normal: "Ảnh bổ sung",
}

const getEmptyFormValues = () => ({
  title: "",
  price: "",
  location: "",
  area: "",
  contact_phone: "",
  description: "",
  latitude: "",
  longitude: "",
  max_people: "",
  deposit: "",
  electricity_price: "",
  water_price: "",
  internet_price: "",
  parking_price: "",
  house_rules: "",
  minimum_stay_months: "",
  amenities: "",
})

type FormValues = ReturnType<typeof getEmptyFormValues>

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "Đang cập nhật"
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

const formatDate = (value?: string) => {
  if (!value) return "—"
  return new Date(value).toLocaleString("vi-VN", { hour12: false })
}

export default function RoomDetailDialog({
  roomId,
  open,
  onOpenChange,
  onAfterUpload,
  fallbackRoom,
  context = "pending",
}: RoomDetailDialogProps) {
  const isPendingContext = context === "pending"
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<ImageTypeOption>("main")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formValues, setFormValues] = useState<FormValues>(getEmptyFormValues)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(new Set())
  const [deletingImages, setDeletingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { showError } = useErrorOverlay()

  const displayedRoom = useMemo(() => {
    if (room) return room

    if (!fallbackRoom) return null

    const normalizedImages = (fallbackRoom.images || []).map((image, index) => ({
      ...image,
      image_id: image.image_id ?? image.id ?? index,
    })) as RoomImage[]

    return { ...fallbackRoom, images: normalizedImages } as Room
  }, [room, fallbackRoom])

  const populateFormValues = useCallback((source: Partial<Room>) => {
    const toStringValue = (value: unknown) => {
      if (value === null || value === undefined) return ""
      return String(value)
    }

    setFormValues({
      title: toStringValue(source.title),
      price: toStringValue(source.price),
      location: toStringValue(source.location),
      area: toStringValue(source.area),
      contact_phone: toStringValue(source.contact_phone),
      description: toStringValue(source.description),
      latitude: toStringValue(source.latitude),
      longitude: toStringValue(source.longitude),
      max_people: toStringValue(source.max_people),
      deposit: toStringValue(source.deposit),
      electricity_price: toStringValue(source.electricity_price),
      water_price: toStringValue(source.water_price),
      internet_price: toStringValue(source.internet_price),
      parking_price: toStringValue(source.parking_price),
      house_rules: toStringValue(source.house_rules),
      minimum_stay_months: toStringValue(source.minimum_stay_months),
      amenities: formatAmenities(source.amenities_detail ?? source.amenities)
        .map((amenity) => amenity.name)
        .join(", "),
    })
  }, [])

  const handleFormInputChange = (
    field: keyof FormValues
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetForm = () => {
    if (room) {
      populateFormValues(room)
      return
    }

    if (fallbackRoom) {
      populateFormValues(fallbackRoom)
      return
    }

    setFormValues(getEmptyFormValues())
  }

  const toggleImageSelection = (imageId: number) => {
    setSelectedImageIds((prev) => {
      const updated = new Set(prev)
      if (updated.has(imageId)) {
        updated.delete(imageId)
      } else {
        updated.add(imageId)
      }
      return updated
    })
  }

  useEffect(() => {
    if (!open || !roomId) return

    let cancelled = false

    const fetchRoomDetail = async () => {
      try {
        setLoading(true)
        const detail = await RoomsService.getRoomById(roomId)
        let images = detail.images

        if (!images || images.length === 0) {
          try {
            images = await RoomsService.getRoomImages(roomId)
          } catch (imageError) {
            console.error("Không tải được danh sách ảnh:", imageError)
          }
        }

        if (!cancelled) {
          setRoom({ ...detail, images: images || [] })
          populateFormValues(detail)
          setSelectedImageIds(new Set())
        }
      } catch (error) {
        console.error("Không tải được chi tiết phòng:", error)
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Không thể lấy dữ liệu phòng, vui lòng thử lại."
          showError(message || "Không thể lấy dữ liệu phòng, vui lòng thử lại.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRoomDetail()

    return () => {
      cancelled = true
    }
  }, [open, roomId, toast, populateFormValues])

  useEffect(() => {
    if (!open) {
      setRoom(null)
      setSelectedFiles([])
      setSelectedType("main")
    setFormValues(getEmptyFormValues())
      setSelectedImageIds(new Set())
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    if (room) {
      populateFormValues(room)
      return
    }

    if (fallbackRoom) {
      populateFormValues(fallbackRoom)
    }
  }, [open, room, fallbackRoom, populateFormValues])

  const groupedImages = useMemo(() => {
    if (!displayedRoom) return []
    const groups = displayedRoom.images.reduce<Record<ImageTypeOption, RoomImage[]>>((acc, image) => {
      if (!acc[image.image_type]) {
        acc[image.image_type] = []
      }
      acc[image.image_type]!.push(image)
      return acc
    }, {} as Record<ImageTypeOption, RoomImage[]>)

    return Object.entries(groups)
      .map(([key, value]) => ({ type: key as ImageTypeOption, images: value }))
      .sort((a, b) => a.type.localeCompare(b.type))
  }, [displayedRoom])

  const handleFileChange = (files: FileList | null) => {
    if (!files) {
      setSelectedFiles([])
      return
    }
    setSelectedFiles(Array.from(files))
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!roomId) {
      showError("Không thể cập nhật vì thiếu mã phòng.")
      return
    }

    const title = formValues.title.trim()
    const location = formValues.location.trim()
    const contactPhone = formValues.contact_phone.trim()
    const description = formValues.description.trim()

    if (!title || !formValues.price.trim() || !location || !formValues.area.trim() || !contactPhone || !description) {
      showError("Vui lòng điền đầy đủ tiêu đề, giá, địa chỉ, diện tích, số điện thoại và mô tả.")
      return
    }

    const priceValue = Number(formValues.price)
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      showError("Giá phòng phải là số hợp lệ lớn hơn 0.")
      return
    }

    const areaValue = Number(formValues.area)
    if (Number.isNaN(areaValue) || areaValue <= 0) {
      showError("Diện tích phải là số hợp lệ lớn hơn 0.")
      return
    }

    const parseOptionalNumber = (value: string, label: string) => {
      const trimmed = value.trim()
      if (!trimmed) return { value: null as number | null, valid: true }
      const parsed = Number(trimmed)
      if (Number.isNaN(parsed)) {
        showError(`${label} phải là số hợp lệ.`)
        return { value: null as number | null, valid: false }
      }
      return { value: parsed, valid: true }
    }

    const latitudeResult = parseOptionalNumber(formValues.latitude, "Vĩ độ")
    if (!latitudeResult.valid) return
    const longitudeResult = parseOptionalNumber(formValues.longitude, "Kinh độ")
    if (!longitudeResult.valid) return
    const maxPeopleResult = parseOptionalNumber(formValues.max_people, "Sức chứa tối đa")
    if (!maxPeopleResult.valid) return
    const depositResult = parseOptionalNumber(formValues.deposit, "Tiền cọc")
    if (!depositResult.valid) return
    const electricityResult = parseOptionalNumber(formValues.electricity_price, "Giá điện")
    if (!electricityResult.valid) return
    const waterResult = parseOptionalNumber(formValues.water_price, "Giá nước")
    if (!waterResult.valid) return
    const internetResult = parseOptionalNumber(formValues.internet_price, "Giá internet")
    if (!internetResult.valid) return
    const parkingResult = parseOptionalNumber(formValues.parking_price, "Giá giữ xe")
    if (!parkingResult.valid) return
    const minimumStayResult = parseOptionalNumber(formValues.minimum_stay_months, "Số tháng tối thiểu")
    if (!minimumStayResult.valid) return

    const amenities = formValues.amenities
      .split(/[,\n]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    const payload: Record<string, any> = {
      title,
      price: priceValue,
      location,
      area: areaValue,
      contact_phone: contactPhone,
      description,
      latitude: latitudeResult.value,
      longitude: longitudeResult.value,
      max_people: maxPeopleResult.value,
      deposit: depositResult.value,
      electricity_price: electricityResult.value,
      water_price: waterResult.value,
      internet_price: internetResult.value,
      parking_price: parkingResult.value,
      house_rules: formValues.house_rules.trim() || null,
      minimum_stay_months: minimumStayResult.value,
      amenities,
    }

    try {
      setIsSaving(true)
      await RoomsService.updateRoom(roomId, payload)
      const refreshed = await RoomsService.getRoomById(roomId)
      let refreshedImages = refreshed.images || []
      if (refreshedImages.length === 0) {
        try {
          refreshedImages = await RoomsService.getRoomImages(roomId)
        } catch (imageRefreshError) {
          console.error("Không thể cập nhật danh sách ảnh:", imageRefreshError)
        }
      }
      setRoom({ ...refreshed, images: refreshedImages })
      populateFormValues(refreshed)
      setSelectedImageIds(new Set())
      if (onAfterUpload) {
        onAfterUpload()
      }
      toast({
        title: "Đã lưu thay đổi",
        description: "Thông tin phòng đã được cập nhật thành công.",
      })
    } catch (error) {
      console.error("Không thể cập nhật phòng:", error)
      const message = error instanceof Error ? error.message : "Không thể lưu thay đổi, vui lòng thử lại."
      showError(message || "Không thể lưu thay đổi, vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpload = async () => {
    if (!roomId || selectedFiles.length === 0) {
      showError("Vui lòng chọn ít nhất một ảnh để tải lên.")
      return
    }

    try {
      setUploading(true)
      await RoomsService.uploadRoomImages(roomId, selectedType, selectedFiles)
      toast({
        title: "Tải ảnh thành công",
        description: isPendingContext ? "Ảnh đã được thêm vào phòng chờ duyệt." : "Ảnh đã được thêm vào phòng.",
      })
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (onAfterUpload) {
        onAfterUpload()
      }
      const refreshed = await RoomsService.getRoomById(roomId)
      let refreshedImages = refreshed.images || []
      if (refreshedImages.length === 0) {
        try {
          refreshedImages = await RoomsService.getRoomImages(roomId)
        } catch (imageRefreshError) {
          console.error("Không thể cập nhật danh sách ảnh:", imageRefreshError)
        }
      }
      setRoom({ ...refreshed, images: refreshedImages })
      populateFormValues(refreshed)
      setSelectedImageIds(new Set())
    } catch (error) {
      console.error("Không tải được ảnh:", error)

      const apiError = error as {
        status?: number | string
        message?: string
        detail?: string
        details?: { detail?: string }
      }

      const backendDetail =
        apiError?.details?.detail ??
        apiError?.detail ??
        apiError?.message ??
        (typeof error === "string" ? error : null)

      const numericStatus = typeof apiError?.status === "string" ? Number(apiError.status) : apiError?.status

      if (numericStatus === 400 && backendDetail) {
        showError(backendDetail)
        return
      }

      if (numericStatus === 403 && backendDetail) {
        showError(backendDetail)
        return
      }

      showError("Vui lòng kiểm tra lại định dạng ảnh và thử lại.")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImages = async () => {
    if (!roomId) {
      showError("Không thể xóa ảnh vì thiếu mã phòng.")
      return
    }

    if (selectedImageIds.size === 0) {
      showError("Vui lòng chọn ít nhất một ảnh để xóa.")
      return
    }

    try {
      setDeletingImages(true)
      const ids = Array.from(selectedImageIds)
      const response = await RoomsService.deleteRoomImages(ids)
      const refreshed = await RoomsService.getRoomById(roomId)
      let refreshedImages = refreshed.images || []
      if (refreshedImages.length === 0) {
        try {
          refreshedImages = await RoomsService.getRoomImages(roomId)
        } catch (imageRefreshError) {
          console.error("Không thể cập nhật danh sách ảnh:", imageRefreshError)
        }
      }
      setSelectedImageIds(new Set())
      setRoom({ ...refreshed, images: refreshedImages })
      populateFormValues(refreshed)
      if (onAfterUpload) {
        onAfterUpload()
      }
      toast({
        title: response.message || "Đã xóa ảnh",
        description: `Đã xóa ${response.deleted_count ?? ids.length} ảnh thành công.`,
      })
    } catch (error) {
      console.error("Không thể xóa ảnh:", error)
      const message = error instanceof Error ? error.message : "Không thể xóa ảnh đã chọn, vui lòng thử lại."
      showError(message || "Không thể xóa ảnh đã chọn, vui lòng thử lại.")
    } finally {
      setDeletingImages(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isPendingContext ? "Chi tiết phòng chờ duyệt" : "Chi tiết phòng"}</DialogTitle>
          <DialogDescription>
            Xem thông tin phòng và bổ sung hình ảnh trước khi quyết định duyệt.
          </DialogDescription>
        </DialogHeader>

        {loading && !displayedRoom ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : displayedRoom ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{displayedRoom.title}</h2>
                    <p className="text-muted-foreground">{displayedRoom.location || "Đang cập nhật địa chỉ"}</p>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {formatCurrency(displayedRoom.price)} / tháng
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <h3 className="font-medium text-foreground">Thông tin cơ bản</h3>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <dt>Diện tích</dt>
                        <dd className="font-medium text-foreground">{displayedRoom.area ? `${displayedRoom.area} m²` : "—"}</dd>
                      </div>
                      <div>
                        <dt>Sức chứa tối đa</dt>
                        <dd className="font-medium text-foreground">{displayedRoom.max_people || "—"}</dd>
                      </div>
                      <div>
                        <dt>Tiền cọc</dt>
                        <dd className="font-medium text-foreground">{formatCurrency(displayedRoom.deposit)}</dd>
                      </div>
                      <div>
                        <dt>Ngày tạo</dt>
                        <dd className="font-medium text-foreground">{formatDate(displayedRoom.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <h3 className="font-medium text-foreground">Thông tin liên hệ</h3>
                    <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div>
                        <dt>Chủ phòng</dt>
                        <dd className="font-medium text-foreground">{displayedRoom.owner?.username || displayedRoom.owner_username || "—"}</dd>
                      </div>
                      <div>
                        <dt>Số điện thoại</dt>
                        <dd className="font-medium text-foreground">{displayedRoom.contact_phone || "—"}</dd>
                      </div>
                      <div>
                        <dt>Giờ liên hệ</dt>
                        <dd className="font-medium text-foreground">{displayedRoom.contact_hours || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Chỉnh sửa thông tin phòng</h3>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật dữ liệu trước khi phê duyệt. Các trường đánh dấu * là bắt buộc.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={handleResetForm} disabled={isSaving}>
                      Khôi phục
                    </Button>
                    <Button type="submit" form="pending-room-edit-form" disabled={isSaving}>
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </div>

                <form id="pending-room-edit-form" onSubmit={handleSave} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-title">Tiêu đề *</Label>
                      <Input
                        id="pending-room-title"
                        value={formValues.title}
                        onChange={handleFormInputChange("title")}
                        placeholder="Phòng trọ trung cấp gần Đại học Y Dược"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-price">Giá phòng (VND) *</Label>
                      <Input
                        id="pending-room-price"
                        type="number"
                        min="0"
                        value={formValues.price}
                        onChange={handleFormInputChange("price")}
                        placeholder="1500000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pending-room-location">Địa chỉ *</Label>
                      <Input
                        id="pending-room-location"
                        value={formValues.location}
                        onChange={handleFormInputChange("location")}
                        placeholder="2P7J+HXP, Đường Số 10, An Bình, Ninh Kiều, Cần Thơ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-area">Diện tích (m²) *</Label>
                      <Input
                        id="pending-room-area"
                        type="number"
                        min="0"
                        value={formValues.area}
                        onChange={handleFormInputChange("area")}
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-contact">Số điện thoại *</Label>
                      <Input
                        id="pending-room-contact"
                        value={formValues.contact_phone}
                        onChange={handleFormInputChange("contact_phone")}
                        placeholder="0909123456"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-lat">Vĩ độ</Label>
                      <Input
                        id="pending-room-lat"
                        value={formValues.latitude}
                        onChange={handleFormInputChange("latitude")}
                        placeholder="10.0139484"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-lng">Kinh độ</Label>
                      <Input
                        id="pending-room-lng"
                        value={formValues.longitude}
                        onChange={handleFormInputChange("longitude")}
                        placeholder="105.7324263"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-max">Sức chứa tối đa</Label>
                      <Input
                        id="pending-room-max"
                        value={formValues.max_people}
                        onChange={handleFormInputChange("max_people")}
                        placeholder="2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-deposit">Tiền cọc (VND)</Label>
                      <Input
                        id="pending-room-deposit"
                        value={formValues.deposit}
                        onChange={handleFormInputChange("deposit")}
                        placeholder="2500000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-electric">Giá điện (VND)</Label>
                      <Input
                        id="pending-room-electric"
                        value={formValues.electricity_price}
                        onChange={handleFormInputChange("electricity_price")}
                        placeholder="3500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-water">Giá nước (VND)</Label>
                      <Input
                        id="pending-room-water"
                        value={formValues.water_price}
                        onChange={handleFormInputChange("water_price")}
                        placeholder="15000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-internet">Giá internet (VND)</Label>
                      <Input
                        id="pending-room-internet"
                        value={formValues.internet_price}
                        onChange={handleFormInputChange("internet_price")}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-parking">Giá giữ xe (VND)</Label>
                      <Input
                        id="pending-room-parking"
                        value={formValues.parking_price}
                        onChange={handleFormInputChange("parking_price")}
                        placeholder="50000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="pending-room-minimum">Số tháng thuê tối thiểu</Label>
                      <Input
                        id="pending-room-minimum"
                        value={formValues.minimum_stay_months}
                        onChange={handleFormInputChange("minimum_stay_months")}
                        placeholder="6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pending-room-description">Mô tả chi tiết *</Label>
                    <Textarea
                      id="pending-room-description"
                      value={formValues.description}
                      onChange={handleFormInputChange("description")}
                      placeholder="Phòng trọ mới xây, đầy đủ tiện nghi..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-rules">Nội quy</Label>
                      <Textarea
                        id="pending-room-rules"
                        value={formValues.house_rules}
                        onChange={handleFormInputChange("house_rules")}
                        placeholder="Giữ gìn vệ sinh chung..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pending-room-amenities">Tiện ích (phân cách bằng dấu phẩy)</Label>
                      <Textarea
                        id="pending-room-amenities"
                        value={formValues.amenities}
                        onChange={handleFormInputChange("amenities")}
                        placeholder="wifi, air_conditioner, private_bathroom, parking"
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ví dụ: wifi, air_conditioner, private_bathroom, parking
                      </p>
                    </div>
                  </div>

                  <button type="submit" className="hidden" aria-hidden="true" />
                </form>
              </section>

              <Separator />

              <section className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Thêm ảnh minh họa</h3>
                    <p className="text-sm text-muted-foreground">
                      Chọn loại ảnh và tải lên nhiều file cùng lúc. {isPendingContext ? "Ảnh mới sẽ được lưu ở trạng thái chờ duyệt." : "Ảnh mới sẽ hiển thị ngay cho phòng."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="image-type" className="text-sm font-medium text-foreground">
                        Loại ảnh
                      </Label>
                      <Select value={selectedType} onValueChange={(value: ImageTypeOption) => setSelectedType(value)}>
                        <SelectTrigger id="image-type" className="w-48">
                          <SelectValue placeholder="Chọn loại ảnh" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(imageTypeLabels) as ImageTypeOption[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              {imageTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => handleFileChange(event.target.files)}
                      className="max-w-xs"
                    />
                    <Button onClick={handleUpload} disabled={uploading}>
                      {uploading ? "Đang tải..." : "Tải ảnh lên"}
                    </Button>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Đã chọn {selectedFiles.length} tệp. Dung lượng tối đa tùy thuộc cấu hình máy chủ.
                  </p>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-medium text-foreground">Danh sách ảnh hiện có</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedImageIds.size} ảnh được chọn</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteImages}
                      disabled={deletingImages || selectedImageIds.size === 0}
                    >
                      {deletingImages ? "Đang xóa..." : "Xóa ảnh đã chọn"}
                    </Button>
                  </div>
                </div>
                {groupedImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có ảnh nào trong kho lưu trữ.</p>
                ) : (
                  <div className="space-y-6">
                    {groupedImages.map((group) => (
                      <div key={group.type} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{imageTypeLabels[group.type]}</h4>
                          <Badge variant="outline">{group.images.length} ảnh</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {group.images.map((img) => {
                            const imageData = img as RoomImage & { image_id?: number; id?: number }
                            const imageId = typeof imageData.image_id === "number" ? imageData.image_id : imageData.id
                            const isSelectable = imageId !== undefined
                            const isChecked = isSelectable ? selectedImageIds.has(imageId) : false

                            return (
                              <div
                                key={imageId ?? img.original_url}
                                className="relative aspect-video overflow-hidden rounded-lg border"
                              >
                                <div className="absolute left-2 top-2 z-10 flex items-center gap-2 rounded-md bg-black/50 px-2 py-1 text-white">
                                  <Checkbox
                                    checked={isChecked}
                                    disabled={!isSelectable}
                                    onCheckedChange={(checked) => {
                                      if (!isSelectable || typeof checked !== "boolean") return
                                      toggleImageSelection(imageId)
                                    }}
                                    className="h-4 w-4 border-white data-[state=checked]:bg-primary"
                                  />
                                  <Badge variant="secondary" className="bg-white/90 text-xs font-semibold text-foreground">
                                    {isSelectable ? `#${imageId}` : "N/A"}
                                  </Badge>
                                </div>
                                <Image
                                  src={img.optimized_url || img.original_url}
                                  alt={`${imageTypeLabels[group.type]} - ${displayedRoom.title}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Chưa chọn phòng để hiển thị chi tiết.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng cửa sổ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
