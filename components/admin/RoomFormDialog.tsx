"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Check, ChevronDown, Upload, X, MapPin } from "lucide-react"
import RoomsService from "@/lib/rooms-service"
import { amenitiesService, type Amenity } from "@/lib/amenities-service"
import DistrictSelector from "@/components/DistrictSelector"
import MapLocationPicker from "@/components/MapLocationPicker"
import type { Room, CreateRoomPayload } from "@/types/room"
import Image from "next/image"
import { createPortal } from "react-dom"

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room // If editing existing room
  onSuccess?: () => void
}

export default function RoomFormDialog({ open, onOpenChange, room, onSuccess }: RoomFormDialogProps) {
  const isEditing = !!room
  
  // Form state
  const [formData, setFormData] = useState<CreateRoomPayload>({
    title: "",
    price: 0,
    location: "",
    area: 0,
    description: "",
    contact_phone: "",
  })
  
  const [districtId, setDistrictId] = useState<number | undefined>(undefined)
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [showMapPicker, setShowMapPicker] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [loadingAmenities, setLoadingAmenities] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true)
        const amenities = await amenitiesService.fetchAmenities()
        setAvailableAmenities(amenities)
      } catch (err) {
        console.error("Failed to load amenities:", err)
      } finally {
        setLoadingAmenities(false)
      }
    }
    fetchAmenities()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (isEditing && room) {
      setFormData({
        title: room.title || "",
        price: room.price || 0,
        location: room.location || "",
        area: room.area || 0,
        description: room.description || "",
        contact_phone: room.contact_phone || "",
        max_people: room.max_people || undefined,
        deposit: room.deposit || undefined,
        electricity_price: room.electricity_price || undefined,
        water_price: room.water_price || undefined,
        internet_price: room.internet_price || undefined,
        parking_price: room.parking_price || undefined,
        house_rules: room.house_rules || "",
        minimum_stay_months: room.minimum_stay_months || undefined,
        has_mezzanine: room.has_mezzanine || false,
        latitude: room.latitude ? parseFloat(room.latitude) : undefined,
        longitude: room.longitude ? parseFloat(room.longitude) : undefined,
        contact_hours: room.contact_hours || "",
      })
      
      // Set amenities
      const amenityIds = room.amenities_detail?.map(a => a.id).filter(Boolean) as number[] || []
      setSelectedAmenities(amenityIds)
    } else {
      // Reset form for new room
      setFormData({
        title: "",
        price: 0,
        location: "",
        area: 0,
        description: "",
        contact_phone: "",
        has_mezzanine: false,
      })
      setSelectedAmenities([])
      setImageFiles([])
      setImagePreviews([])
      setDistrictId(undefined)
    }
  }, [isEditing, room])

  const handleInputChange = (field: keyof CreateRoomPayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageFiles(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleLocationSelect = (location: { address: string; coordinates: [number, number]; radius: number }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      latitude: location.coordinates[0],
      longitude: location.coordinates[1],
    }))
    setShowMapPicker(false)
  }

  const handleSubmit = async () => {
    setError(null)
    
    // Validation
    if (!formData.title?.trim()) {
      setError("Vui lòng nhập tiêu đề phòng")
      return
    }
    if (!formData.price || formData.price <= 0) {
      setError("Vui lòng nhập giá phòng hợp lệ")
      return
    }
    if (!formData.location?.trim()) {
      setError("Vui lòng nhập địa chỉ")
      return
    }
    if (!formData.area || formData.area <= 0) {
      setError("Vui lòng nhập diện tích hợp lệ")
      return
    }
    if (!formData.contact_phone?.trim()) {
      setError("Vui lòng nhập số điện thoại liên hệ")
      return
    }

    try {
      setLoading(true)
      
      const payload: CreateRoomPayload = {
        ...formData,
        amenity_ids: selectedAmenities,
      }

      let createdRoom: Room

      if (isEditing && room) {
        // Update existing room
        createdRoom = await RoomsService.updateRoom(room.id, payload)
      } else {
        // Create new room
        createdRoom = await RoomsService.createRoom(payload)
      }

      // Upload images if any
      if (imageFiles.length > 0 && createdRoom.id) {
        await RoomsService.uploadRoomImages(createdRoom.id, 'main', imageFiles)
      }

      // Success
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        title: "",
        price: 0,
        location: "",
        area: 0,
        description: "",
        contact_phone: "",
      })
      setSelectedAmenities([])
      setImageFiles([])
      setImagePreviews([])
      
    } catch (err: any) {
      setError(err.message || `Không thể ${isEditing ? 'cập nhật' : 'tạo'} phòng`)
      console.error("Error submitting room:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Cập nhật thông tin phòng trọ' : 'Điền thông tin để tạo phòng trọ mới'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Thông tin cơ bản</h3>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề phòng *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="VD: Phòng trọ cao cấp Q1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Giá thuê (VNĐ) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                        placeholder="2000000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Diện tích (m²) *</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Địa chỉ *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="123 Đường ABC, Quận X, TP.HCM"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowMapPicker(true)}
                        title="Chọn vị trí trên bản đồ"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-muted-foreground">
                        📍 Tọa độ: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">
                        Vĩ độ (Latitude)
                        <span className="ml-1 text-xs text-muted-foreground">- Tự động từ bản đồ</span>
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={formData.latitude || ''}
                        onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="10.762622"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">
                        Kinh độ (Longitude)
                        <span className="ml-1 text-xs text-muted-foreground">- Tự động từ bản đồ</span>
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={formData.longitude || ''}
                        onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="106.660172"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Click icon <MapPin className="inline h-3 w-3" /> bên cạnh địa chỉ để chọn vị trí trên bản đồ và tự động điền tọa độ
                  </p>

                  <div className="space-y-2">
                    <Label>Quận/Huyện</Label>
                    <DistrictSelector
                      value={districtId}
                      onChange={(id) => setDistrictId(id)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Số điện thoại liên hệ *</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="0901234567"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Chi tiết thêm</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_people">Số người tối đa</Label>
                    <Input
                      id="max_people"
                      type="number"
                      value={formData.max_people || ''}
                      onChange={(e) => handleInputChange('max_people', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      value={formData.deposit || ''}
                      onChange={(e) => handleInputChange('deposit', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="5000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electricity_price">Giá điện (VNĐ/kWh)</Label>
                    <Input
                      id="electricity_price"
                      type="number"
                      value={formData.electricity_price || ''}
                      onChange={(e) => handleInputChange('electricity_price', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="3500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water_price">Giá nước (VNĐ/m³)</Label>
                    <Input
                      id="water_price"
                      type="number"
                      value={formData.water_price || ''}
                      onChange={(e) => handleInputChange('water_price', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="15000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="internet_price">Giá internet (VNĐ/tháng)</Label>
                    <Input
                      id="internet_price"
                      type="number"
                      value={formData.internet_price || ''}
                      onChange={(e) => handleInputChange('internet_price', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="100000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parking_price">Giá gửi xe (VNĐ/tháng)</Label>
                    <Input
                      id="parking_price"
                      type="number"
                      value={formData.parking_price || ''}
                      onChange={(e) => handleInputChange('parking_price', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Mô tả chi tiết về phòng trọ..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_mezzanine"
                    checked={formData.has_mezzanine}
                    onCheckedChange={(checked) => handleInputChange('has_mezzanine', checked)}
                  />
                  <Label htmlFor="has_mezzanine" className="cursor-pointer">
                    Có gác lửng
                  </Label>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label>Tiện ích</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="text-sm">
                        {selectedAmenities.length > 0
                          ? `Đã chọn ${selectedAmenities.length} tiện ích`
                          : "Chọn tiện ích"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                    {loadingAmenities ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Đang tải...
                      </div>
                    ) : availableAmenities.length > 0 ? (
                      availableAmenities.map((amenity) => (
                        <DropdownMenuItem
                          key={amenity.id}
                          className="cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault()
                            handleAmenityToggle(amenity.id)
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              {amenity.icon_url && (
                                <Image
                                  src={amenity.icon_url}
                                  alt={amenity.name}
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 object-contain"
                                  unoptimized
                                />
                              )}
                              <span className="text-sm">{amenity.name}</span>
                            </div>
                            {selectedAmenities.includes(amenity.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Không có tiện ích
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAmenities.map(id => {
                      const amenity = availableAmenities.find(a => a.id === id)
                      return amenity ? (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {amenity.icon_url && (
                            <Image
                              src={amenity.icon_url}
                              alt={amenity.name}
                              width={16}
                              height={16}
                              className="h-4 w-4"
                              unoptimized
                            />
                          )}
                          {amenity.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              {/* Images */}
              {!isEditing && (
                <div className="space-y-3">
                  <Label>Hình ảnh</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-video">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Tạo phòng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showMapPicker && typeof window !== "undefined" &&
        createPortal(
          <MapLocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
            defaultLocation={{
              address: formData.location || "",
              coordinates: [
                formData.latitude || 10.762622,
                formData.longitude || 106.660172
              ],
              radius: 2,
            }}
          />,
          document.body,
        )}
    </>
  )
}
