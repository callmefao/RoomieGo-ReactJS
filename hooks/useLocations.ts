"use client"

/**
 * useLocations Hook
 * =================
 * Custom hook để manage districts và universities state
 * 
 * Features:
 * - Load districts on mount (with caching)
 * - Load universities khi district thay đổi (cascade)
 * - Return loading states
 * - Error handling
 * 
 * Usage:
 * const {
 *   districts,
 *   universities,
 *   selectedDistrict,
 *   setSelectedDistrict,
 *   selectedUniversity,
 *   setSelectedUniversity,
 *   loading,
 *   error
 * } = useLocations()
 */

import { useState, useEffect } from "react"
import { LocationsService } from "@/lib/locations-service"
import type { District, University } from "@/types/location"

interface UseLocationsOptions {
  /**
   * Auto-load districts on mount
   * @default true
   */
  autoLoadDistricts?: boolean
  
  /**
   * Initial district ID or slug
   */
  initialDistrict?: number | string
  
  /**
   * Initial university code
   */
  initialUniversity?: string
}

interface UseLocationsReturn {
  // Data
  districts: District[]
  universities: University[]
  
  // Selected values
  selectedDistrict: number | undefined
  selectedDistrictSlug: string | undefined
  selectedUniversity: string | undefined
  
  // Setters
  setSelectedDistrict: (districtId: number, districtSlug: string) => void
  setSelectedUniversity: (universityCode: string) => void
  
  // States
  loadingDistricts: boolean
  loadingUniversities: boolean
  error: string | null
  
  // Actions
  refreshDistricts: () => Promise<void>
  refreshUniversities: () => Promise<void>
}

export function useLocations(options: UseLocationsOptions = {}): UseLocationsReturn {
  const {
    autoLoadDistricts = true,
    initialDistrict,
    initialUniversity,
  } = options

  // Data state
  const [districts, setDistricts] = useState<District[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  
  // Selected values
  const [selectedDistrict, setSelectedDistrictId] = useState<number | undefined>(
    typeof initialDistrict === 'number' ? initialDistrict : undefined
  )
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string | undefined>()
  const [selectedUniversity, setSelectedUniversityCode] = useState<string | undefined>(initialUniversity)
  
  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingUniversities, setLoadingUniversities] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  /**
   * Load districts from API (with caching)
   */
  const loadDistricts = async () => {
    try {
      setLoadingDistricts(true)
      setError(null)
      
      const data = await LocationsService.getDistrictsCached()
      setDistricts(data)
      
      // If initialDistrict is a slug, find the ID
      if (typeof initialDistrict === 'string') {
        const district = data.find(d => d.slug === initialDistrict)
        if (district) {
          setSelectedDistrictId(district.id)
          setSelectedDistrictSlug(district.slug)
        }
      }
    } catch (err) {
      console.error('Error loading districts:', err)
      setError('Không thể tải danh sách quận/huyện')
    } finally {
      setLoadingDistricts(false)
    }
  }

  /**
   * Load universities based on selected district
   */
  const loadUniversities = async (districtId?: number) => {
    try {
      setLoadingUniversities(true)
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
      console.error('Error loading universities:', err)
      setError('Không thể tải danh sách trường học')
    } finally {
      setLoadingUniversities(false)
    }
  }

  /**
   * Refresh districts (force fetch from API)
   */
  const refreshDistricts = async () => {
    try {
      setLoadingDistricts(true)
      setError(null)
      
      const data = await LocationsService.getDistricts()
      setDistricts(data)
    } catch (err) {
      console.error('Error refreshing districts:', err)
      setError('Không thể làm mới danh sách quận/huyện')
    } finally {
      setLoadingDistricts(false)
    }
  }

  /**
   * Refresh universities (force fetch from API)
   */
  const refreshUniversities = async () => {
    try {
      setLoadingUniversities(true)
      setError(null)
      
      const data = await LocationsService.getUniversities()
      setUniversities(data)
    } catch (err) {
      console.error('Error refreshing universities:', err)
      setError('Không thể làm mới danh sách trường học')
    } finally {
      setLoadingUniversities(false)
    }
  }

  /**
   * Set selected district (with slug)
   */
  const setSelectedDistrict = (districtId: number, districtSlug: string) => {
    setSelectedDistrictId(districtId)
    setSelectedDistrictSlug(districtSlug)
    
    // Reset university when district changes
    setSelectedUniversityCode(undefined)
  }

  /**
   * Set selected university
   */
  const setSelectedUniversity = (universityCode: string) => {
    setSelectedUniversityCode(universityCode)
  }

  // Load districts on mount
  useEffect(() => {
    if (autoLoadDistricts) {
      loadDistricts()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load universities when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadUniversities(selectedDistrict)
    } else {
      // Load all universities if no district selected
      loadUniversities()
    }
  }, [selectedDistrict])

  return {
    // Data
    districts,
    universities,
    
    // Selected values
    selectedDistrict,
    selectedDistrictSlug,
    selectedUniversity,
    
    // Setters
    setSelectedDistrict,
    setSelectedUniversity,
    
    // States
    loadingDistricts,
    loadingUniversities,
    error,
    
    // Actions
    refreshDistricts,
    refreshUniversities,
  }
}

/**
 * Example usage:
 * 
 * function MyComponent() {
 *   const {
 *     districts,
 *     universities,
 *     selectedDistrict,
 *     setSelectedDistrict,
 *     selectedUniversity,
 *     setSelectedUniversity,
 *     loadingDistricts,
 *     loadingUniversities,
 *   } = useLocations()
 * 
 *   return (
 *     <div>
 *       <DistrictSelector
 *         value={selectedDistrict}
 *         onChange={(id, slug) => setSelectedDistrict(id, slug)}
 *       />
 *       
 *       {selectedDistrict && (
 *         <UniversitySelector
 *           value={selectedUniversity}
 *           onChange={setSelectedUniversity}
 *           districtId={selectedDistrict}
 *         />
 *       )}
 *     </div>
 *   )
 * }
 */
