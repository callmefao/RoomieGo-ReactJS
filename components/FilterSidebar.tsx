"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import MapLocationPicker from "./MapLocationPicker"
import DistrictSelector from "./DistrictSelector"
import UniversitySelector from "./UniversitySelector"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { amenitiesService, type Amenity } from "@/lib/amenities-service"
import Image from "next/image"
import { ChevronDown, Check, Layers } from "lucide-react"

interface FilterState {
  // Location filters (from locations app)
  district?: number // District ID
  districtSlug?: string // District slug for URL
  university?: string // University code
  
  location: {
    address: string
    coordinates: [number, number]
    radius: number
  }
  priceRange: {
    min: number
    max: number
  }
  amenities: number[]
  hasMezzanine: boolean | null // null = không lọc, true = có gác, false = không có gác
  // targetAudience: string[]
}

// const targetAudienceOptions = [
//   { id: "students", label: "Sinh viên", value: "students" },
//   { id: "office-workers", label: "Nhân viên văn phòng", value: "office-workers" },
//   { id: "families", label: "Gia đình", value: "families" },
//   { id: "others", label: "Khác", value: "others" },
// ]

export default function FilterSidebar() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    location: {
      address: "",
      coordinates: [0, 0],
      radius: 2,
    },
    priceRange: {
      min: 500000,
      max: 2500000,
    },
    amenities: [],
    hasMezzanine: null,
  })

  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([])
  const [loadingAmenities, setLoadingAmenities] = useState(true)

  // Fetch amenities on component mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true)
        const amenities = await amenitiesService.fetchAmenities()
        setAvailableAmenities(amenities)
      } catch (error) {
        console.error('Failed to fetch amenities:', error)
      } finally {
        setLoadingAmenities(false)
      }
    }

    fetchAmenities()
  }, [])

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

  // const handleTargetAudienceChange = (value: string, checked: boolean) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     targetAudience: checked ? [...prev.targetAudience, value] : prev.targetAudience.filter((item) => item !== value),
  //   }))
  // }

  const handleAmenityChange = (amenityId: number, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter((id) => id !== amenityId),
    }))
  }

  const handleMezzanineChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      hasMezzanine: value === "all" ? null : value === "true",
    }))
  }

  const handleApplyFilters = () => {
    console.log("🔍 FilterSidebar applying filters:", filters)
    
    // Build search params from filters
    const params = new URLSearchParams()
    
    // Add district filter (PRIMARY)
    if (filters.districtSlug) {
      params.append('district', filters.districtSlug)
      console.log(`➕ Added district param: ${filters.districtSlug}`)
    }
    
    // Add university filter (GPS-based search)
    if (filters.university) {
      params.append('university', filters.university)
      console.log(`➕ Added university param: ${filters.university}`)
    }
    
    // Add location filters only if a location is actually selected (not empty)
    if (filters.location && filters.location.address && filters.location.address.trim() !== "") {
      params.append('latitude', filters.location.coordinates[0].toString())
      params.append('longitude', filters.location.coordinates[1].toString())
      params.append('radius', filters.location.radius.toString())
      console.log(`➕ Added location params: lat=${filters.location.coordinates[0]}, lng=${filters.location.coordinates[1]}, radius=${filters.location.radius}`)
    }
    
    // Add price range filters
    if (filters.priceRange) {
      params.append('min_price', filters.priceRange.min.toString())
      params.append('max_price', filters.priceRange.max.toString())
      console.log(`➕ Added price params: min=${filters.priceRange.min}, max=${filters.priceRange.max}`)
    }

    // Add amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      params.append('amenities', filters.amenities.join(','))
      console.log(`➕ Added amenities params: ${filters.amenities.join(',')}`)
    }

    // Add mezzanine filter
    if (filters.hasMezzanine !== null) {
      params.append('has_mezzanine', filters.hasMezzanine.toString())
      console.log(`➕ Added has_mezzanine param: ${filters.hasMezzanine}`)
    }
    
    // Navigate to rental listings with filters
    const queryString = params.toString()
    const url = queryString ? `/rental-listings?${queryString}` : '/rental-listings'
    
    console.log("🚀 Navigating to:", url)
    router.push(url)
  }

  const handleClearFilters = () => {
    setFilters({
      district: undefined,
      districtSlug: undefined,
      university: undefined,
      location: {
        address: "",
        coordinates: [0, 0],
        radius: 2,
      },
      priceRange: {
        min: 500000,
        max: 2500000,
      },
      amenities: [],
      hasMezzanine: null,
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
          <CardTitle className="text-xl font-bold">Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto">
          {/* District & University Filters */}
          <div className="space-y-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                📍 Quận/Huyện
              </Label>
              <DistrictSelector
                value={filters.district}
                onChange={(id, slug) => {
                  setFilters((prev) => ({
                    ...prev,
                    district: id,
                    districtSlug: slug,
                    university: undefined, // Reset university khi đổi district
                  }))
                }}
                className="w-full"
              />
            </div>

            {filters.district && (
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  🎓 Trường học (tùy chọn)
                </Label>
                <UniversitySelector
                  value={filters.university}
                  onChange={(code) => {
                    setFilters((prev) => ({
                      ...prev,
                      university: code,
                    }))
                  }}
                  districtId={filters.district}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Tìm phòng trong bán kính 3km quanh trường
                </p>
              </div>
            )}
          </div>

          {/* Address Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Địa chỉ GPS (tùy chọn)</Label>
            <div className="space-y-2">
              {filters.location.address ? (
                <>
                  <div className="text-sm text-muted-foreground line-clamp-2 cursor-default hover:text-foreground transition-colors duration-200">{filters.location.address}</div>
                  <div className="text-sm text-muted-foreground cursor-default hover:text-foreground transition-colors duration-200">Bán kính: {filters.location.radius}km</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground italic cursor-default hover:text-foreground transition-colors duration-200">Chưa chọn vị trí cụ thể</div>
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

          {/* Price Range Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Khoảng Giá</Label>
            <div className="space-y-4">
              <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                <Slider
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={handlePriceRangeChange}
                  min={500000}
                  max={20000000}
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

          {/* Amenities Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Tiện ích</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="text-sm">
                    {filters.amenities.length > 0
                      ? `Đã chọn ${filters.amenities.length} tiện ích`
                      : "Chọn tiện ích"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                {loadingAmenities ? (
                  <div className="space-y-2 p-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : availableAmenities.length > 0 ? (
                  availableAmenities.map((amenity) => (
                    <DropdownMenuItem
                      key={amenity.id}
                      className="cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault()
                        handleAmenityChange(amenity.id, !filters.amenities.includes(amenity.id))
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
                        {filters.amenities.includes(amenity.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground italic text-center">
                    Không có tiện ích nào
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mezzanine Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Gác lửng</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm">
                    {filters.hasMezzanine === null && "Tất cả"}
                    {filters.hasMezzanine === true && (
                      <>
                        <Layers className="h-4 w-4" />
                        Có gác lửng
                      </>
                    )}
                    {filters.hasMezzanine === false && "Không có gác lửng"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => handleMezzanineChange("all")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">Tất cả</span>
                    {filters.hasMezzanine === null && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => handleMezzanineChange("true")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4" />
                      Có gác lửng
                    </span>
                    {filters.hasMezzanine === true && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => handleMezzanineChange("false")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">Không có gác lửng</span>
                    {filters.hasMezzanine === false && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Target Audience Filter - Commented out as requested */}
          {/* 
          <div className="space-y-3">
            <Label className="text-base font-semibold">Đối tượng thuê</Label>
            <div className="space-y-3">
              {targetAudienceOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={filters.targetAudience.includes(option.value)}
                    onCheckedChange={(checked) => handleTargetAudienceChange(option.value, checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          */}
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
          document.body,
        )}
    </>
  )
}
