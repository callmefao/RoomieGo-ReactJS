"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, MapPin, Upload, X, ImageIcon } from "lucide-react"
import { findRoomieService } from "@/lib/findroomie-service"
import { mapGenderToApi, mapOccupationToApi, mapLifestyleToApi } from "@/lib/utils/findroomie-mapper"
import MapLocationPicker from "@/components/MapLocationPicker"
import DistrictSelector from "@/components/DistrictSelector"
import ProtectedRoute from "@/components/ProtectedRoute"
import { createPortal } from "react-dom"
import { canthoUniversities } from "@/data/universities"
import type { Gender, OccupationType, LifestyleType } from "@/types/roomie"
import Image from "next/image"

interface CreateRoomieForm {
  title: string
  full_name: string
  age: number
  gender: Gender | ""
  occupation: OccupationType | ""
  workplace_or_school: string
  activity_time: LifestyleType | ""
  
  // District (REQUIRED)
  district?: number
  districtSlug?: string
  
  // GPS coordinates (OPTIONAL)
  latitude: number
  longitude: number
  location_description: string
  search_radius_km: number
  
  budget_min: number
  budget_max: number
  self_description: string
  roommate_requirements: string
  additional_notes: string
  contact_phone: string
  contact_hours: string
  contact_zalo: string
  contact_facebook: string
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export default function CreateRoomiePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const [formData, setFormData] = useState<CreateRoomieForm>({
    title: "",
    full_name: "",
    age: 22,
    gender: "",
    occupation: "",
    workplace_or_school: "",
    activity_time: "",
    latitude: 10.0341802,
    longitude: 105.7889878,
    location_description: "",
    search_radius_km: 2,
    budget_min: 2000000,
    budget_max: 5000000,
    self_description: "",
    roommate_requirements: "",
    additional_notes: "",
    contact_phone: "",
    contact_hours: "9:00 - 21:00",
    contact_zalo: "",
    contact_facebook: "",
  })

  const handleLocationSelect = (location: { address: string; coordinates: [number, number]; radius: number }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.coordinates[0],
      longitude: location.coordinates[1],
      location_description: location.address,
      search_radius_km: location.radius,
    }))
    setShowLocationPicker(false)
  }

  const handleBudgetChange = (values: number[]) => {
    setFormData(prev => ({
      ...prev,
      budget_min: values[0],
      budget_max: values[1],
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError(null)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Vui lòng nhập tiêu đề"
    if (!formData.full_name.trim()) return "Vui lòng nhập họ tên"
    if (formData.age < 18) return "Tuổi phải từ 18 trở lên"
    if (formData.age > 100) return "Tuổi không hợp lệ"
    if (!formData.gender) return "Vui lòng chọn giới tính"
    if (!formData.occupation) return "Vui lòng chọn nghề nghiệp"
    if (!formData.activity_time) return "Vui lòng chọn thời gian sinh hoạt"
    
    // District is REQUIRED
    if (!formData.district) return "Vui lòng chọn quận/huyện"
    
    // GPS location is OPTIONAL now
    // if (!formData.location_description.trim()) return "Vui lòng chọn vị trí trên bản đồ"
    
    if (formData.budget_min >= formData.budget_max) return "Ngân sách tối đa phải lớn hơn tối thiểu"
    if (!formData.self_description.trim()) return "Vui lòng mô tả về bản thân"
    if (!formData.contact_phone.trim()) return "Vui lòng nhập số điện thoại"
    
    // Validate phone number (basic)
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(formData.contact_phone.replace(/\s/g, ''))) {
      return "Số điện thoại không hợp lệ (10-11 chữ số)"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Map frontend types to API types
      const payload = {
        title: formData.title.trim(),
        full_name: formData.full_name.trim(),
        age: formData.age,
        gender: mapGenderToApi(formData.gender as Gender),
        occupation: mapOccupationToApi(formData.occupation as OccupationType),
        workplace_or_school: formData.workplace_or_school.trim() || undefined,
        activity_time: mapLifestyleToApi(formData.activity_time as LifestyleType),
        
        // District (REQUIRED)
        district: formData.district,
        
        // GPS coordinates (OPTIONAL)
        latitude: formData.latitude,
        longitude: formData.longitude,
        location_description: formData.location_description.trim() || undefined,
        search_radius_km: formData.search_radius_km,
        
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
        self_description: formData.self_description.trim(),
        roommate_requirements: formData.roommate_requirements.trim() || undefined,
        additional_notes: formData.additional_notes.trim() || undefined,
        contact_phone: formData.contact_phone.trim(),
        contact_hours: formData.contact_hours.trim(),
        contact_zalo: formData.contact_zalo.trim() || undefined,
        contact_facebook: formData.contact_facebook.trim() || undefined,
      }
      
      console.log("📤 Submitting roommate post:", payload)
      
      const response = await findRoomieService.createRoommate(payload)
      
      console.log("✅ Post created successfully:", response)
      
      // Upload avatar if provided
      if (avatarFile && response.id) {
        try {
          setUploadingAvatar(true)
          console.log("📤 Uploading avatar...")
          await findRoomieService.uploadAvatar(response.id, avatarFile)
          console.log("✅ Avatar uploaded successfully")
        } catch (avatarError: any) {
          console.error("⚠️ Avatar upload failed:", avatarError)
          // Don't fail the whole operation if avatar upload fails
          // Just log the error and continue
        } finally {
          setUploadingAvatar(false)
        }
      }
      
      // Redirect to detail page
      router.push(`/find-roomie/${response.id}`)
    } catch (err: any) {
      console.error("❌ Error creating post:", err)
      
      // Handle API errors
      if (err.details) {
        const errorMessages = Object.entries(err.details)
          .map(([field, messages]: [string, any]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgArray.join(', ')}`
          })
          .join('\n')
        setError(errorMessages)
      } else {
        setError(err.message || "Không thể tạo bài đăng. Vui lòng thử lại.")
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requireAuth={true}>
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push("/find-roomie")} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Đăng bài tìm bạn ở ghép</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Điền thông tin để tìm bạn ở ghép phù hợp với bạn
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Ảnh đại diện</Label>
                {avatarPreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="rounded-full object-cover border-4 border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={loading || uploadingAvatar}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <label 
                      htmlFor="avatar-upload"
                      className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-full cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground text-center px-2">Tải ảnh lên</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={loading || uploadingAvatar}
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Ảnh đại diện giúp bài đăng của bạn nổi bật hơn (Tối đa 5MB)
                </p>
              </div>

              {/* Tiêu đề */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề bài đăng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Sinh viên IT tìm bạn ở ghép gần trường"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/200 ký tự
                </p>
              </div>

              {/* Thông tin cá nhân */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">
                    Tuổi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={18}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                  />
                </div>
              </div>

              {/* Giới tính và Nghề nghiệp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: Gender) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">
                    Nghề nghiệp <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.occupation}
                    onValueChange={(value: OccupationType) => setFormData(prev => ({ 
                      ...prev, 
                      occupation: value,
                      // Don't clear workplace_or_school when switching
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nghề nghiệp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                      <SelectItem value="Đã đi làm">Đã đi làm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trường/Nơi làm việc */}
              <div className="space-y-2">
                <Label htmlFor="workplace_or_school">
                  {formData.occupation === "Sinh viên" ? "Trường đang học" : "Nơi làm việc"}
                </Label>
                {formData.occupation === "Sinh viên" ? (
                  <Select
                    value={formData.workplace_or_school || undefined}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, workplace_or_school: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trường (không bắt buộc)" />
                    </SelectTrigger>
                    <SelectContent>
                      {canthoUniversities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.name}>
                          {uni.shortName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="workplace_or_school"
                    value={formData.workplace_or_school}
                    onChange={(e) => setFormData(prev => ({ ...prev, workplace_or_school: e.target.value }))}
                    placeholder="VD: Công ty TNHH ABC (không bắt buộc)"
                  />
                )}
              </div>

              {/* Thời gian sinh hoạt */}
              <div className="space-y-2">
                <Label htmlFor="activity_time">
                  Thời gian sinh hoạt <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.activity_time}
                  onValueChange={(value: LifestyleType) => setFormData(prev => ({ ...prev, activity_time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ban ngày">Ban ngày</SelectItem>
                    <SelectItem value="Ban đêm">Ban đêm</SelectItem>
                    <SelectItem value="Linh hoạt">Linh hoạt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* District (REQUIRED) */}
              <div className="space-y-2 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                <Label htmlFor="district" className="text-base font-semibold">
                  📍 Quận/Huyện <span className="text-red-500">*</span>
                </Label>
                <DistrictSelector
                  value={formData.district}
                  onChange={(id, slug) => {
                    setFormData(prev => ({
                      ...prev,
                      district: id,
                      districtSlug: slug,
                    }))
                  }}
                  required
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Chọn quận/huyện mà bạn muốn tìm bạn ở ghép (bắt buộc)
                </p>
              </div>

              {/* Vị trí GPS (OPTIONAL) */}
              <div className="space-y-2">
                <Label>
                  Vị trí GPS chi tiết (tùy chọn)
                </Label>
                {formData.location_description ? (
                  <div className="p-4 border rounded-lg space-y-2 bg-muted/30">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm">{formData.location_description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bán kính tìm kiếm: {formData.search_radius_km} km
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chưa chọn vị trí</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full"
                >
                  {formData.location_description ? "Thay đổi vị trí" : "Chọn vị trí trên bản đồ"}
                </Button>
              </div>

              {/* Ngân sách */}
              <div className="space-y-2">
                <Label>
                  Ngân sách (VND/tháng) <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-4">
                  <Slider
                    value={[formData.budget_min, formData.budget_max]}
                    onValueChange={handleBudgetChange}
                    min={1000000}
                    max={15000000}
                    step={500000}
                    className="w-full"
                  />
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget_min: parseInt(e.target.value) || 1000000 
                      }))}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget_max: parseInt(e.target.value) || 5000000 
                      }))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {currencyFormatter.format(formData.budget_min)} - {currencyFormatter.format(formData.budget_max)}
                  </p>
                </div>
              </div>

              {/* Mô tả bản thân */}
              <div className="space-y-2">
                <Label htmlFor="self_description">
                  Mô tả về bản thân <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="self_description"
                  value={formData.self_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, self_description: e.target.value }))}
                  placeholder="Giới thiệu về bản thân, tính cách, sở thích..."
                  rows={5}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.self_description.length}/1000 ký tự
                </p>
              </div>

              {/* Yêu cầu người ở ghép */}
              <div className="space-y-2">
                <Label htmlFor="roommate_requirements">
                  Yêu cầu người ở ghép
                </Label>
                <Textarea
                  id="roommate_requirements"
                  value={formData.roommate_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, roommate_requirements: e.target.value }))}
                  placeholder="VD: Tìm bạn sạch sẽ, không hút thuốc, yên tĩnh..."
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.roommate_requirements.length}/1000 ký tự
                </p>
              </div>

              {/* Ghi chú thêm */}
              <div className="space-y-2">
                <Label htmlFor="additional_notes">
                  Ghi chú thêm
                </Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                  placeholder="Các thông tin bổ sung khác..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.additional_notes.length}/500 ký tự
                </p>
              </div>

              {/* Thông tin liên hệ */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold">Thông tin liên hệ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="0901234567"
                      maxLength={11}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_hours">
                      Giờ liên hệ
                    </Label>
                    <Input
                      id="contact_hours"
                      value={formData.contact_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_hours: e.target.value }))}
                      placeholder="9:00 - 21:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_zalo">
                      Zalo
                    </Label>
                    <Input
                      id="contact_zalo"
                      value={formData.contact_zalo}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_zalo: e.target.value }))}
                      placeholder="0901234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_facebook">
                      Facebook
                    </Label>
                    <Input
                      id="contact_facebook"
                      value={formData.contact_facebook}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_facebook: e.target.value }))}
                      placeholder="https://facebook.com/yourname"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/find-roomie")}
                  className="flex-1"
                  disabled={loading || uploadingAvatar}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || uploadingAvatar}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploadingAvatar ? "Đang tải ảnh..." : "Đang đăng..."}
                    </>
                  ) : (
                    "Đăng bài"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {showLocationPicker &&
        typeof window !== "undefined" &&
        createPortal(
          <MapLocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
            defaultLocation={{
              address: formData.location_description,
              coordinates: [formData.latitude, formData.longitude],
              radius: formData.search_radius_km,
            }}
          />,
          document.body
        )}
    </>
    </ProtectedRoute>
  )
}
