"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, DollarSign, Users, ChevronDown, Map, Sparkles, Layers } from "lucide-react"
import MapLocationPicker from "./MapLocationPicker"
import { canthoUniversities } from "@/data/universities"
import { cn } from "@/lib/utils"
import { amenitiesService, type Amenity } from "@/lib/amenities-service"
import Image from "next/image"

// Helper function to convert price range to numbers
function parsePriceRange(priceText: string): { min_price?: number, max_price?: number } {
  const priceMap: Record<string, { min_price?: number, max_price?: number }> = {
    "Dưới 2 triệu": { max_price: 2000000 },
    "2-3 triệu": { min_price: 2000000, max_price: 3000000 },
    "3-4 triệu": { min_price: 3000000, max_price: 4000000 },
    "4-5 triệu": { min_price: 4000000, max_price: 5000000 },
    "5-7 triệu": { min_price: 5000000, max_price: 7000000 },
    "7-10 triệu": { min_price: 7000000, max_price: 10000000 },
    "Trên 10 triệu": { min_price: 10000000 }
  }
  return priceMap[priceText] || {}
}

// Helper function to parse university location
function parseUniversityLocation(addressText: string): { latitude?: number, longitude?: number, radius?: number } {
  const universityMap: Record<string, { lat: number, lng: number }> = {
    "ĐH Cần Thơ": { lat: 10.0302, lng: 105.7703 },
    "ĐH FPT Cần Thơ": { lat: 10.0349, lng: 105.7692 },
    "ĐH Kỹ thuật Y tế Cần Thơ": { lat: 10.0325, lng: 105.7678 },
    "ĐH Nam Cần Thơ": { lat: 10.0089, lng: 105.7567 }
  }
  
  // Parse format like "ĐH Cần Thơ (2km)"
  const match = addressText.match(/^(.+?)\s*\((\d+)km\)$/)
  if (match) {
    const [, universityName, radiusStr] = match
    const university = universityMap[universityName]
    if (university) {
      return {
        latitude: university.lat,
        longitude: university.lng,
        radius: parseInt(radiusStr)
      }
    }
  }
  
  return {}
}

const filterOptions = {
  address: [
    "Ninh Kiều", 
    "Bình Thuỷ", 
    "Cái Răng", 
    "Ô Môn", 
    "Thốt Nốt", 
    "Phong Điền", 
    "Cờ Đỏ", 
    "Vĩnh Thạnh", 
    "Thới Lai",
    "--- Gần trường Đại học ---",
    "ĐH Cần Thơ (2km)",
    "ĐH Cần Thơ (3km)", 
    "ĐH Cần Thơ (5km)",
    "ĐH FPT Cần Thơ (2km)",
    "ĐH FPT Cần Thơ (3km)",
    "ĐH FPT Cần Thơ (5km)",
    "ĐH Kỹ thuật Y tế Cần Thơ (2km)",
    "ĐH Kỹ thuật Y tế Cần Thơ (3km)",
    "ĐH Kỹ thuật Y tế Cần Thơ (5km)",
    "ĐH Nam Cần Thơ (2km)",
    "ĐH Nam Cần Thơ (3km)",
    "ĐH Nam Cần Thơ (5km)"
  ],
  price: ["Dưới 2 triệu", "2-3 triệu", "3-4 triệu", "4-5 triệu", "5-7 triệu", "7-10 triệu", "Trên 10 triệu"],
  target: ["Sinh viên", "Người đi làm", "Gia đình nhỏ", "Cặp đôi", "Một mình"],
}

const filters = [
  {
    id: "address",
    label: "Địa chỉ",
    icon: MapPin,
    placeholder: "Chọn khu vực",
  },
  {
    id: "price",
    label: "Giá cả",
    icon: DollarSign,
    placeholder: "Chọn mức giá",
  },
  {
    id: "amenities",
    label: "Tiện ích",
    icon: Sparkles,
    placeholder: "Chọn tiện ích",
  },
  {
    id: "mezzanine",
    label: "Gác lửng",
    icon: Layers,
    placeholder: "Chọn gác lửng",
  },
  // {
  //   id: "target",
  //   label: "Đối tượng",
  //   icon: Users,
  //   placeholder: "Ai thuê",
  // },
]

interface FilterButtonsProps {
  onFiltersChange?: (filters: Record<string, any>) => void
}

export default function FilterButtons({ onFiltersChange }: FilterButtonsProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [selectedMezzanine, setSelectedMezzanine] = useState<boolean | null>(null)
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([])
  const [loadingAmenities, setLoadingAmenities] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    lat: number
    lng: number
    radius: number
  } | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)

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

  // Build API filters from given selections (or current state)
  const buildApiFilters = (customFilters?: Record<string, string>, customLocation?: typeof selectedLocation, customAmenities?: number[], customMezzanine?: boolean | null) => {
    const filtersToUse = customFilters || selectedFilters
    const locationToUse = customLocation !== undefined ? customLocation : selectedLocation
    const amenitiesToUse = customAmenities !== undefined ? customAmenities : selectedAmenities
    const mezzanineToUse = customMezzanine !== undefined ? customMezzanine : selectedMezzanine
    const apiFilters: Record<string, any> = {}
    
    // Price filters
    if (filtersToUse.price) {
      const priceFilter = parsePriceRange(filtersToUse.price)
      Object.assign(apiFilters, priceFilter)
    }
    
    // Location filters
    if (locationToUse) {
      apiFilters.latitude = locationToUse.lat
      apiFilters.longitude = locationToUse.lng
      apiFilters.radius = locationToUse.radius
    } else if (filtersToUse.address && filtersToUse.address.includes("ĐH ")) {
      // University location filter
      const locationFilter = parseUniversityLocation(filtersToUse.address)
      Object.assign(apiFilters, locationFilter)
    }

    // Amenities filter
    if (amenitiesToUse && amenitiesToUse.length > 0) {
      apiFilters.amenities = amenitiesToUse.join(',')
    }

    // Mezzanine filter
    if (mezzanineToUse !== null) {
      apiFilters.has_mezzanine = mezzanineToUse
    }
    
    return apiFilters
  }

  // Notify parent component when filters change
  const notifyFiltersChange = () => {
    if (onFiltersChange) {
      const apiFilters = buildApiFilters()
      onFiltersChange(apiFilters)
    }
  }

    const handleFilterSelect = (filterId: string, value: string) => {
    if (value === "") {
      // Clear filter
      setSelectedFilters((prev) => {
        const updated = { ...prev }
        delete updated[filterId]
        return updated
      })
      return
    }

    // Check if this is a university selection
    if (filterId === "address" && value.includes("ĐH ")) {
      const universityMatch = value.match(/ĐH (.+?) \((\d+)km\)/)
      if (universityMatch) {
        const [, universityName, radius] = universityMatch
        
        // Find university by name mapping
        const universityMap: Record<string, string> = {
          "Cần Thơ": "cantho",
          "FPT Cần Thơ": "fpt-cantho", 
          "Kỹ thuật Y tế Cần Thơ": "ctump",
          "Nam Cần Thơ": "ncu"
        }
        
        const universityId = universityMap[universityName]
        const university = canthoUniversities.find(uni => uni.id === universityId)
        
        if (university) {
          setSelectedLocation({
            address: university.address,
            lat: university.location.lat,
            lng: university.location.lng,
            radius: parseInt(radius)
          })
        }
      }
    }

    setSelectedFilters((prev) => {
      const updated = { ...prev, [filterId]: value }
      // Notify parent component with updated filters
      setTimeout(() => {
        const apiFilters = buildApiFilters(updated)
        if (onFiltersChange) {
          onFiltersChange(apiFilters)
        }
      }, 0)
      return updated
    })
  }

  const clearFilter = (filterId: string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[filterId]
      return newFilters
    })
    const newLocation = filterId === "address" ? null : selectedLocation
    const newAmenities = filterId === "amenities" ? [] : selectedAmenities
    const newMezzanine = filterId === "mezzanine" ? null : selectedMezzanine
    
    if (filterId === "address") {
      setSelectedLocation(null)
    }
    if (filterId === "amenities") {
      setSelectedAmenities([])
    }
    if (filterId === "mezzanine") {
      setSelectedMezzanine(null)
    }
    
    // Notify parent component with updated filters
    setTimeout(() => {
      const updatedFilters = { ...selectedFilters }
      delete updatedFilters[filterId]
      const apiFilters = buildApiFilters(updatedFilters, newLocation, newAmenities, newMezzanine)
      if (onFiltersChange) {
        onFiltersChange(apiFilters)
      }
    }, 0)
  }

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenities((prev) => {
      const newAmenities = prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
      
      // Notify parent component with updated amenities
      setTimeout(() => {
        const apiFilters = buildApiFilters(undefined, undefined, newAmenities)
        if (onFiltersChange) {
          onFiltersChange(apiFilters)
        }
      }, 0)
      
      return newAmenities
    })
  }

  const handleMezzanineChange = (value: string) => {
    const newMezzanine = value === "all" ? null : value === "true"
    setSelectedMezzanine(newMezzanine)
    
    // Update filter display text
    if (value === "all") {
      setSelectedFilters((prev) => {
        const updated = { ...prev }
        delete updated.mezzanine
        return updated
      })
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        mezzanine: value === "true" ? "Có gác lửng" : "Không có gác lửng"
      }))
    }

    // Notify parent component
    setTimeout(() => {
      const apiFilters = buildApiFilters(undefined, undefined, undefined, newMezzanine)
      if (onFiltersChange) {
        onFiltersChange(apiFilters)
      }
    }, 0)
  }

  const handleLocationSelect = (location: { 
    address: string; 
    coordinates: [number, number]; 
    radius: number;
  }) => {
    const [lat, lng] = location.coordinates
    const newLocation = {
      address: location.address,
      lat,
      lng,
      radius: location.radius
    }
    setSelectedLocation(newLocation)
    setSelectedFilters((prev) => ({
      ...prev,
      address: `${location.address.split(",")[0]} (${location.radius}km)`,
    }))
    // Notify parent component with location filters
    if (onFiltersChange) {
      const apiFilters = {
        latitude: lat,
        longitude: lng,
        radius: location.radius
      }
      onFiltersChange(apiFilters)
    }
  }

  return (
    <>
      <div className="flex justify-center gap-3 flex-wrap max-w-2xl mx-auto">
        {/* Address Filter - Direct Map Button */}
        <Button
          onClick={() => setShowMapPicker(true)}
          variant={selectedLocation ? "default" : "outline"}
          className={`
            px-4 py-3 h-auto rounded-xl font-medium transition-all duration-300
            flex items-center gap-2 min-w-[140px] justify-center cursor-pointer
            backdrop-blur-sm hover:scale-105 active:scale-95
            ${
              selectedLocation
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-200/25"
                : "bg-white/80 border-2 border-blue-200/50 hover:border-blue-300 hover:bg-blue-50/80 text-slate-700 shadow-sm"
            }
          `}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {selectedLocation 
              ? `${selectedLocation.address.split(",")[0]} (${selectedLocation.radius}km)`
              : "Chọn khu vực"
            }
          </span>
          <Map className="w-4 h-4 opacity-60" />
        </Button>

        {/* Other filters as dropdowns */}
        {filters.filter(filter => filter.id !== "address").map((filter) => {
          const Icon = filter.icon
          const selectedValue = selectedFilters[filter.id]
          
          // Special handling for amenities filter
          if (filter.id === "amenities") {
            return (
              <DropdownMenu key={filter.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={selectedAmenities.length > 0 ? "default" : "outline"}
                    className={`
                      px-4 py-3 h-auto rounded-xl font-medium transition-all duration-300
                      flex items-center gap-2 min-w-[140px] justify-between cursor-pointer
                      backdrop-blur-sm hover:scale-105 active:scale-95
                      ${
                        selectedAmenities.length > 0
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-200/25"
                          : "bg-white/80 border-2 border-blue-200/50 hover:border-blue-300 hover:bg-blue-50/80 text-slate-700 shadow-sm"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedAmenities.length > 0 
                          ? `${selectedAmenities.length} tiện ích`
                          : filter.placeholder
                        }
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 max-h-80 overflow-y-auto">
                  {selectedAmenities.length > 0 && (
                    <>
                      <DropdownMenuItem
                        onClick={() => clearFilter(filter.id)}
                        className="text-muted-foreground font-medium border-b cursor-pointer"
                      >
                        Xóa bộ lọc
                      </DropdownMenuItem>
                    </>
                  )}
                  {loadingAmenities ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Đang tải...
                    </div>
                  ) : availableAmenities.length > 0 ? (
                    availableAmenities.map((amenity) => (
                      <DropdownMenuItem
                        key={amenity.id}
                        onClick={(e) => {
                          e.preventDefault()
                          handleAmenityToggle(amenity.id)
                        }}
                        className="flex items-center gap-3 cursor-pointer py-3"
                      >
                        <Checkbox
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => handleAmenityToggle(amenity.id)}
                        />
                        {amenity.icon_url && (
                          <Image
                            src={amenity.icon_url}
                            alt={amenity.name}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain"
                            unoptimized
                          />
                        )}
                        <span className="text-sm">{amenity.name}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Không có tiện ích
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          // Special handling for mezzanine filter
          if (filter.id === "mezzanine") {
            return (
              <DropdownMenu key={filter.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={selectedMezzanine !== null ? "default" : "outline"}
                    className={`
                      px-4 py-3 h-auto rounded-xl font-medium transition-all duration-300
                      flex items-center gap-2 min-w-[140px] justify-between cursor-pointer
                      backdrop-blur-sm hover:scale-105 active:scale-95
                      ${
                        selectedMezzanine !== null
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-200/25"
                          : "bg-white/80 border-2 border-blue-200/50 hover:border-blue-300 hover:bg-blue-50/80 text-slate-700 shadow-sm"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedFilters.mezzanine || filter.placeholder}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {selectedMezzanine !== null && (
                    <>
                      <DropdownMenuItem
                        onClick={() => clearFilter(filter.id)}
                        className="text-muted-foreground font-medium border-b cursor-pointer"
                      >
                        Xóa bộ lọc
                      </DropdownMenuItem>
                    </>
                  )}
                  <div className="p-2">
                    <RadioGroup
                      value={
                        selectedMezzanine === null
                          ? "all"
                          : selectedMezzanine
                            ? "true"
                            : "false"
                      }
                      onValueChange={handleMezzanineChange}
                    >
                      <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="all" id="filter-mezzanine-all" />
                        <label htmlFor="filter-mezzanine-all" className="text-sm cursor-pointer flex-1">
                          Tất cả
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="true" id="filter-mezzanine-true" />
                        <label htmlFor="filter-mezzanine-true" className="text-sm cursor-pointer flex-1">
                          Có gác lửng
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="false" id="filter-mezzanine-false" />
                        <label htmlFor="filter-mezzanine-false" className="text-sm cursor-pointer flex-1">
                          Không có gác lửng
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return (
            <DropdownMenu key={filter.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={selectedValue ? "default" : "outline"}
                  className={`
                    px-4 py-3 h-auto rounded-xl font-medium transition-all duration-300
                    flex items-center gap-2 min-w-[140px] justify-between cursor-pointer
                    backdrop-blur-sm hover:scale-105 active:scale-95
                    ${
                      selectedValue
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-200/25"
                        : "bg-white/80 border-2 border-blue-200/50 hover:border-blue-300 hover:bg-blue-50/80 text-slate-700 shadow-sm"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{selectedValue || filter.placeholder}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 max-h-60 overflow-y-auto">
                {selectedValue && (
                  <>
                    <DropdownMenuItem
                      onClick={() => clearFilter(filter.id)}
                      className="text-muted-foreground font-medium border-b"
                    >
                      Xóa bộ lọc
                    </DropdownMenuItem>
                  </>
                )}
                {filterOptions[filter.id as keyof typeof filterOptions] && 
                 filterOptions[filter.id as keyof typeof filterOptions].length > 0 && 
                 filterOptions[filter.id as keyof typeof filterOptions].map((option) => {
                  return (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => handleFilterSelect(filter.id, option)}
                      className={`
                        cursor-pointer
                        ${selectedValue === option ? "bg-primary/10 font-medium" : ""}
                      `}
                    >
                      {option}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </div>

      {showMapPicker && typeof window !== "undefined" && createPortal(
        <MapLocationPicker onLocationSelect={handleLocationSelect} onClose={() => setShowMapPicker(false)} />,
        document.body
      )}
    </>
  )
}
