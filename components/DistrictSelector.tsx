"use client"

/**
 * DistrictSelector Component
 * ==========================
 * Reusable dropdown component để chọn quận/huyện
 * 
 * Features:
 * - Load districts từ locations API
 * - Cache trong localStorage (24h)
 * - Show universities count: "Ninh Kiều (6 trường)"
 * - Support cả slug và id
 */

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationsService } from "@/lib/locations-service"
import type { District } from "@/types/location"

interface DistrictSelectorProps {
  value?: number | string // District ID hoặc slug
  onChange: (districtId: number, districtSlug: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

export default function DistrictSelector({
  value,
  onChange,
  placeholder = "-- Chọn quận/huyện --",
  required = false,
  className = "",
  disabled = false,
}: DistrictSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDistricts()
  }, [])

  const loadDistricts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Sử dụng cached version để tránh gọi API nhiều lần
      const data = await LocationsService.getDistrictsCached()
      setDistricts(data)
    } catch (err) {
      console.error("Error loading districts:", err)
      setError("Không thể tải danh sách quận/huyện")
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (selectedValue: string) => {
    // selectedValue có thể là ID (number string)
    const district = districts.find(
      (d) => d.id.toString() === selectedValue
    )
    
    if (district) {
      onChange(district.id, district.slug)
    }
  }

  // Convert value to string for Select component
  const stringValue = value ? value.toString() : undefined

  if (error) {
    return (
      <div className="text-sm text-destructive">
        {error}
        <button
          onClick={loadDistricts}
          className="ml-2 underline hover:no-underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <Select
      value={stringValue}
      onValueChange={handleValueChange}
      disabled={disabled || loading}
      required={required}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Đang tải..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {districts.map((district) => (
          <SelectItem key={district.id} value={district.id.toString()}>
            {district.name}
            {district.universities_count > 0 && (
              <span className="text-muted-foreground ml-1">
                ({district.universities_count} trường)
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
