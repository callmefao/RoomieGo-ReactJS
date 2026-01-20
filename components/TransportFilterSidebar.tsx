"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ChevronDown, Filter, Star } from "lucide-react"
import type { TransportFilters, VehicleType, GoodsType } from "@/types/transport"

interface TransportFilterSidebarProps {
  filters: TransportFilters
  onFiltersChange: (filters: TransportFilters) => void
}

const canthoAreas = [
  "Ninh Kiều",
  "Cái Răng",
  "Bình Thủy",
  "Ô Môn",
  "Thốt Nốt",
  "Vĩnh Thạnh",
  "Cờ Đỏ",
  "Phong Điền",
  "Thới Lai",
]

const vehicleTypes: VehicleType[] = [
  "Ba gác",
  "Tải 0.5 tấn",
  "Tải 1 tấn",
  "Tải 2 tấn",
  "Bán tải",
]

const goodsTypes: GoodsType[] = [
  "Thùng đồ",
  "Xe máy",
  "Máy giặt",
  "Máy lạnh",
  "Tủ lạnh",
  "Hàng cồng kềnh",
  "Hàng dễ vỡ",
  "Hàng điện tử",
]

const ratingOptions = [
  { label: "5 sao", value: 5 },
  { label: "4 sao trở lên", value: 4 },
  { label: "3 sao trở lên", value: 3 },
  { label: "2 sao trở lên", value: 2 },
]

export default function TransportFilterSidebar({
  filters,
  onFiltersChange,
}: TransportFilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.price_min || 0,
    filters.price_max || 500000,
  ])

  const handleAreaToggle = (area: string) => {
    const currentAreas = filters.areas || []
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter((a) => a !== area)
      : [...currentAreas, area]

    onFiltersChange({ ...filters, areas: newAreas })
  }

  const handleVehicleTypeToggle = (type: VehicleType) => {
    const currentTypes = filters.vehicle_types || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]

    onFiltersChange({ ...filters, vehicle_types: newTypes })
  }

  const handleGoodsTypeToggle = (type: GoodsType) => {
    const currentTypes = filters.goods_types || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]

    onFiltersChange({ ...filters, goods_types: newTypes })
  }

  const handlePriceTypeChange = (type: "per_km" | "per_trip") => {
    onFiltersChange({ ...filters, price_type: type })
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
  }

  const handlePriceRangeCommit = () => {
    onFiltersChange({
      ...filters,
      price_min: priceRange[0],
      price_max: priceRange[1],
    })
  }

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating_min: filters.rating_min === rating ? undefined : rating,
    })
  }

  const handleResetFilters = () => {
    setPriceRange([0, 500000])
    onFiltersChange({})
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}tr`
    }
    return `${(price / 1000).toFixed(0)}k`
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-lg">Bộ lọc</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Đặt lại
          </Button>
        </div>

        {/* Khu vực hoạt động */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Khu vực hoạt động</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-sm"
              >
                <span className="truncate">
                  {filters.areas && filters.areas.length > 0
                    ? `${filters.areas.length} khu vực`
                    : "Chọn khu vực"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {canthoAreas.map((area) => (
                <DropdownMenuCheckboxItem
                  key={area}
                  checked={filters.areas?.includes(area)}
                  onCheckedChange={() => handleAreaToggle(area)}
                >
                  {area}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loại xe */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Loại xe</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-sm"
              >
                <span className="truncate">
                  {filters.vehicle_types && filters.vehicle_types.length > 0
                    ? `${filters.vehicle_types.length} loại xe`
                    : "Chọn loại xe"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {vehicleTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.vehicle_types?.includes(type)}
                  onCheckedChange={() => handleVehicleTypeToggle(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loại hàng chở */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Loại hàng chở</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-sm"
              >
                <span className="truncate">
                  {filters.goods_types && filters.goods_types.length > 0
                    ? `${filters.goods_types.length} loại hàng`
                    : "Chọn loại hàng"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {goodsTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.goods_types?.includes(type)}
                  onCheckedChange={() => handleGoodsTypeToggle(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loại giá */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Loại giá</Label>
          <div className="flex gap-2">
            <Button
              variant={filters.price_type === "per_km" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handlePriceTypeChange("per_km")}
            >
              VNĐ/km
            </Button>
            <Button
              variant={
                filters.price_type === "per_trip" ? "default" : "outline"
              }
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handlePriceTypeChange("per_trip")}
            >
              VNĐ/chuyến
            </Button>
          </div>
        </div>

        {/* Khoảng giá */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Khoảng giá</Label>
            <span className="text-xs text-gray-500">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </span>
          </div>
          <Slider
            min={0}
            max={500000}
            step={10000}
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            onValueCommit={handlePriceRangeCommit}
            className="py-4"
          />
        </div>

        {/* Đánh giá */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Đánh giá dịch vụ</Label>
          <div className="space-y-1">
            {ratingOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  filters.rating_min === option.value ? "default" : "outline"
                }
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handleRatingChange(option.value)}
              >
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
