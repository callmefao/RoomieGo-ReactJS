"use client"

/**
 * UniversitySelector Component
 * ============================
 * Reusable dropdown component để chọn trường học
 * 
 * Features:
 * - Load all universities hoặc filter by district
 * - Cascade với DistrictSelector
 * - Show short_name trong dropdown
 * - Cache trong localStorage (24h)
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
import type { University } from "@/types/location"

interface UniversitySelectorProps {
  value?: string // University code (e.g., "fptu-ct")
  onChange: (universityCode: string) => void
  districtId?: number // Optional: filter universities by district
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

export default function UniversitySelector({
  value,
  onChange,
  districtId,
  placeholder = "-- Chọn trường học --",
  required = false,
  className = "",
  disabled = false,
}: UniversitySelectorProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUniversities()
  }, [districtId])

  const loadUniversities = async () => {
    try {
      setLoading(true)
      setError(null)

      let data: University[]

      if (districtId) {
        // Load universities trong district cụ thể
        data = await LocationsService.getUniversitiesInDistrict(districtId)
      } else {
        // Load tất cả universities (cached)
        data = await LocationsService.getUniversitiesCached()
      }

      setUniversities(data)
    } catch (err) {
      console.error("Error loading universities:", err)
      setError("Không thể tải danh sách trường học")
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (selectedValue: string) => {
    onChange(selectedValue)
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        {error}
        <button
          onClick={loadUniversities}
          className="ml-2 underline hover:no-underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled || loading}
      required={required}
    >
      <SelectTrigger className={className}>
        <SelectValue 
          placeholder={
            loading 
              ? "Đang tải..." 
              : districtId && universities.length === 0
              ? "Không có trường trong quận này"
              : placeholder
          } 
        />
      </SelectTrigger>
      <SelectContent>
        {universities.length === 0 && !loading ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Không có trường học
          </div>
        ) : (
          universities.map((university) => (
            <SelectItem key={university.code} value={university.code}>
              {university.short_name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
