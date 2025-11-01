"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import MapLocationPicker from "./MapLocationPicker"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { ChevronDown, Check, Users, GraduationCap, Briefcase, Clock } from "lucide-react"
import type { Gender, OccupationType, LifestyleType } from "@/types/roomie"
import { canthoUniversities } from "@/data/universities"

interface RoomieFilterState {
  location: {
    address: string
    coordinates: [number, number]
    radius: number
  }
  priceRange: {
    min: number
    max: number
  }
  ageRange: {
    min: number
    max: number
  }
  gender: Gender | null
  occupation: OccupationType | null
  school: string
  lifestyle: LifestyleType | null
  roomType: string
  preferredArea: string
}

const genderOptions: Array<{ value: Gender | null; label: string }> = [
  { value: null, label: "Tất cả" },
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
]

const occupationOptions: Array<{ value: OccupationType | null; label: string }> = [
  { value: null, label: "Tất cả" },
  { value: "Sinh viên", label: "Sinh viên" },
  { value: "Đã đi làm", label: "Đã đi làm" },
]

const lifestyleOptions: Array<{ value: LifestyleType | null; label: string }> = [
  { value: null, label: "Tất cả" },
  { value: "Ban ngày", label: "Ban ngày" },
  { value: "Ban đêm", label: "Ban đêm" },
  { value: "Linh hoạt", label: "Linh hoạt" },
]

const roomTypeOptions = [
  { value: "", label: "Tất cả" },
  { value: "Phòng trọ", label: "Phòng trọ" },
  { value: "Căn hộ chung cư", label: "Căn hộ chung cư" },
  { value: "Nhà nguyên căn", label: "Nhà nguyên căn" },
]

const areaOptions = [
  { value: "", label: "Tất cả khu vực" },
  { value: "Ninh Kiều", label: "Quận Ninh Kiều, Cần Thơ" },
  { value: "Cái Răng", label: "Quận Cái Răng, Cần Thơ" },
  { value: "Bình Thủy", label: "Quận Bình Thủy, Cần Thơ" },
  { value: "Ô Môn", label: "Quận Ô Môn, Cần Thơ" },
  { value: "Thốt Nốt", label: "Quận Thốt Nốt, Cần Thơ" },
  { value: "Phong Điền", label: "Huyện Phong Điền, Cần Thơ" },
  { value: "Cờ Đỏ", label: "Huyện Cờ Đỏ, Cần Thơ" },
  { value: "Vĩnh Thạnh", label: "Huyện Vĩnh Thạnh, Cần Thơ" },
  { value: "Thới Lai", label: "Huyện Thới Lai, Cần Thơ" },
]

export default function RoomieFilterSidebar() {
  const router = useRouter()
  const [filters, setFilters] = useState<RoomieFilterState>({
    location: {
      address: "",
      coordinates: [0, 0],
      radius: 2,
    },
    priceRange: {
      min: 1500000,
      max: 8000000,
    },
    ageRange: {
      min: 18,
      max: 40,
    },
    gender: null,
    occupation: null,
    school: "",
    lifestyle: null,
    roomType: "",
    preferredArea: "",
  })

  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const handleLocationSelect = (location: { address: string; coordinates: [number, number]; radius: number }) => {
    setFilters((prev) => ({
      ...prev,
      location,
    }))
    setShowLocationPicker(false)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        min: values[0],
        max: values[1],
      },
    }))
  }

  const handleAgeRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      ageRange: {
        min: values[0],
        max: values[1],
      },
    }))
  }

  const handleApplyFilters = () => {
    console.log("🔍 RoomieFilterSidebar applying filters:", filters)

    // Build search params from filters
    const params = new URLSearchParams()

    // Add location filters
    if (filters.location && filters.location.address && filters.location.address.trim() !== "") {
      params.append("latitude", filters.location.coordinates[0].toString())
      params.append("longitude", filters.location.coordinates[1].toString())
      params.append("radius", filters.location.radius.toString())
    }

    // Add price range filters
    params.append("min_price", filters.priceRange.min.toString())
    params.append("max_price", filters.priceRange.max.toString())

    // Add age range filters
    params.append("min_age", filters.ageRange.min.toString())
    params.append("max_age", filters.ageRange.max.toString())

    // Add gender filter
    if (filters.gender) {
      params.append("gender", filters.gender)
    }

    // Add occupation filter
    if (filters.occupation) {
      params.append("occupation", filters.occupation)
    }

    // Add school filter (only if occupation is Sinh viên)
    if (filters.school && filters.occupation === "Sinh viên") {
      params.append("school", filters.school)
    }

    // Add lifestyle filter
    if (filters.lifestyle) {
      params.append("lifestyle", filters.lifestyle)
    }

    // Add room type filter
    if (filters.roomType) {
      params.append("room_type", filters.roomType)
    }

    // Add preferred area filter
    if (filters.preferredArea) {
      params.append("preferred_area", filters.preferredArea)
    }

    // Navigate to find-roomie with filters
    const queryString = params.toString()
    const url = queryString ? `/find-roomie?${queryString}` : "/find-roomie"

    console.log("🚀 Navigating to:", url)
    router.push(url)
  }

  const handleClearFilters = () => {
    setFilters({
      location: {
        address: "",
        coordinates: [0, 0],
        radius: 2,
      },
      priceRange: {
        min: 1500000,
        max: 8000000,
      },
      ageRange: {
        min: 18,
        max: 40,
      },
      gender: null,
      occupation: null,
      school: "",
      lifestyle: null,
      roomType: "",
      preferredArea: "",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow duration-300 flex flex-col max-h-[calc(100vh-120px)]">
        <CardHeader className="cursor-default flex-shrink-0">
          <CardTitle className="text-xl font-bold">Bộ lọc tìm bạn ở ghép</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto">
          {/* Gender Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Giới tính</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    {filters.gender || "Tất cả"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {genderOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    className="cursor-pointer"
                    onSelect={() => setFilters((prev) => ({ ...prev, gender: option.value }))}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{option.label}</span>
                      {filters.gender === option.value && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Occupation Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Nghề nghiệp</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm">
                    {filters.occupation === "Sinh viên" ? (
                      <GraduationCap className="h-4 w-4" />
                    ) : filters.occupation === "Đã đi làm" ? (
                      <Briefcase className="h-4 w-4" />
                    ) : null}
                    {filters.occupation || "Tất cả"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {occupationOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    className="cursor-pointer"
                    onSelect={() =>
                      setFilters((prev) => ({
                        ...prev,
                        occupation: option.value,
                        school: option.value === "Sinh viên" ? prev.school : "",
                      }))
                    }
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2 text-sm">
                        {option.value === "Sinh viên" && <GraduationCap className="h-4 w-4" />}
                        {option.value === "Đã đi làm" && <Briefcase className="h-4 w-4" />}
                        {option.label}
                      </span>
                      {filters.occupation === option.value && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* School Filter (only show if occupation is Sinh viên) */}
          {filters.occupation === "Sinh viên" && (
            <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
              <Label className="text-base font-semibold cursor-default">Trường đang học</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <span className="text-sm truncate">
                      {filters.school
                        ? canthoUniversities.find((u) => u.id === filters.school)?.shortName || filters.school
                        : "Chọn trường"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => setFilters((prev) => ({ ...prev, school: "" }))}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Tất cả trường</span>
                      {!filters.school && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                  {canthoUniversities.map((uni) => (
                    <DropdownMenuItem
                      key={uni.id}
                      className="cursor-pointer"
                      onSelect={() => setFilters((prev) => ({ ...prev, school: uni.id }))}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{uni.shortName}</span>
                          <span className="text-xs text-muted-foreground">{uni.name}</span>
                        </div>
                        {filters.school === uni.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Age Range Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Độ tuổi</Label>
            <div className="space-y-4">
              <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                <Slider
                  value={[filters.ageRange.min, filters.ageRange.max]}
                  onValueChange={handleAgeRangeChange}
                  min={18}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={filters.ageRange.min}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: { ...prev.ageRange, min: Number(e.target.value) },
                    }))
                  }
                  className="flex-1 cursor-text hover:border-primary/50 focus:border-primary transition-colors duration-200"
                  placeholder="Từ"
                  min={18}
                  max={50}
                />
                <span className="text-muted-foreground cursor-default">-</span>
                <Input
                  type="number"
                  value={filters.ageRange.max}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: { ...prev.ageRange, max: Number(e.target.value) },
                    }))
                  }
                  className="flex-1 cursor-text hover:border-primary/50 focus:border-primary transition-colors duration-200"
                  placeholder="Đến"
                  min={18}
                  max={50}
                />
              </div>
              <div className="text-sm text-muted-foreground text-center cursor-default hover:text-foreground transition-colors duration-200">
                {filters.ageRange.min} - {filters.ageRange.max} tuổi
              </div>
            </div>
          </div>

          {/* Lifestyle Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Thời gian sinh hoạt</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {filters.lifestyle || "Tất cả"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {lifestyleOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    className="cursor-pointer"
                    onSelect={() => setFilters((prev) => ({ ...prev, lifestyle: option.value }))}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{option.label}</span>
                      {filters.lifestyle === option.value && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Address Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Địa chỉ</Label>
            <div className="space-y-2">
              {filters.location.address ? (
                <>
                  <div className="text-sm text-muted-foreground line-clamp-2 cursor-default hover:text-foreground transition-colors duration-200">
                    {filters.location.address}
                  </div>
                  <div className="text-sm text-muted-foreground cursor-default hover:text-foreground transition-colors duration-200">
                    Bán kính: {filters.location.radius}km
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground italic cursor-default hover:text-foreground transition-colors duration-200">
                  Chưa chọn vị trí cụ thể
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationPicker(true)}
                className="w-full cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300 active:scale-95"
              >
                {filters.location.address ? "Thay đổi vị trí" : "Chọn vị trí trên bản đồ"}
              </Button>
            </div>
          </div>

          {/* Preferred Area Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Khu vực mong muốn</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="text-sm truncate">
                    {filters.preferredArea
                      ? areaOptions.find((a) => a.value === filters.preferredArea)?.label
                      : "Tất cả khu vực"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                {areaOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="cursor-pointer"
                    onSelect={() => setFilters((prev) => ({ ...prev, preferredArea: option.value }))}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{option.label}</span>
                      {filters.preferredArea === option.value && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Ngân sách (VND/tháng)</Label>
            <div className="space-y-4">
              <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                <Slider
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={handlePriceRangeChange}
                  min={1000000}
                  max={15000000}
                  step={500000}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={filters.priceRange.min}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: Number(e.target.value) },
                    }))
                  }
                  className="flex-1 cursor-text hover:border-primary/50 focus:border-primary transition-colors duration-200"
                  placeholder="Từ"
                />
                <span className="text-muted-foreground cursor-default">-</span>
                <Input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: Number(e.target.value) },
                    }))
                  }
                  className="flex-1 cursor-text hover:border-primary/50 focus:border-primary transition-colors duration-200"
                  placeholder="Đến"
                />
              </div>
              <div className="text-sm text-muted-foreground text-center cursor-default hover:text-foreground transition-colors duration-200">
                {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
              </div>
            </div>
          </div>

          {/* Room Type Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Loại phòng</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="text-sm">
                    {filters.roomType ? roomTypeOptions.find((r) => r.value === filters.roomType)?.label : "Tất cả"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {roomTypeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="cursor-pointer"
                    onSelect={() => setFilters((prev) => ({ ...prev, roomType: option.value }))}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{option.label}</span>
                      {filters.roomType === option.value && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>

        {/* Action Buttons - Sticky at bottom */}
        <div className="border-t bg-background p-4 flex-shrink-0">
          <div className="space-y-2">
            <Button
              onClick={handleApplyFilters}
              className="w-full cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 active:scale-95 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700"
            >
              Áp dụng bộ lọc
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full bg-transparent cursor-pointer hover:scale-105 hover:shadow-md hover:bg-muted/50 transition-all duration-300 active:scale-95"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {showLocationPicker &&
        typeof window !== "undefined" &&
        createPortal(
          <MapLocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
            defaultLocation={{
              address: filters.location.address,
              coordinates: filters.location.coordinates,
              radius: filters.location.radius,
            }}
          />,
          document.body
        )}
    </>
  )
}
