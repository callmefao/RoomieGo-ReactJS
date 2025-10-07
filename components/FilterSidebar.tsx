"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import MapLocationPicker from "./MapLocationPicker"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"

interface FilterState {
  location: {
    address: string
    coordinates: [number, number]
    radius: number
  }
  priceRange: {
    min: number
    max: number
  }
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

  // const handleTargetAudienceChange = (value: string, checked: boolean) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     targetAudience: checked ? [...prev.targetAudience, value] : prev.targetAudience.filter((item) => item !== value),
  //   }))
  // }

  const handleApplyFilters = () => {
    console.log("🔍 FilterSidebar applying filters:", filters)
    
    // Build search params from filters
    const params = new URLSearchParams()
    
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
    
    // Navigate to rental listings with filters
    const queryString = params.toString()
    const url = queryString ? `/rental-listings?${queryString}` : '/rental-listings'
    
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
        min: 500000,
        max: 2500000,
      },
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
      <Card className="w-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="cursor-default">
          <CardTitle className="text-xl font-bold">Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Filter */}
          <div className="space-y-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
            <Label className="text-base font-semibold cursor-default">Địa chỉ</Label>
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

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
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
        </CardContent>
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
