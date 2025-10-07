"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MapPin, X, GraduationCap } from "lucide-react"
import { canthoUniversities } from "@/data/universities"

interface MapLocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number]; radius: number }) => void
  onClose: () => void
  defaultLocation?: {
    address: string
    coordinates: [number, number]
    radius: number
  }
}

export default function MapLocationPicker({ onLocationSelect, onClose, defaultLocation }: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState({
    address:
      defaultLocation?.address || "118 Đ. Mậu Thân, An Nghiệp, Ninh Kiều, Cần Thơ, Vietnam Cần Thơ 920000 Cần Thơ",
    lat: defaultLocation?.coordinates[0] || 10.0301,
    lng: defaultLocation?.coordinates[1] || 105.7717,
  })
  const [radius, setRadius] = useState([defaultLocation?.radius || 2]) // km
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const circleRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet dynamically
    const loadMap = async () => {
      if (typeof window !== "undefined") {
        const L = (await import("leaflet")).default

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize map centered on Can Tho, Vietnam
          mapInstanceRef.current = L.map(mapRef.current).setView([selectedLocation.lat, selectedLocation.lng], 13)

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapInstanceRef.current)

          // Add marker
          markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(mapInstanceRef.current)

          // Add radius circle
          circleRef.current = L.circle([selectedLocation.lat, selectedLocation.lng], {
            color: "hsl(var(--primary))",
            fillColor: "hsl(var(--primary))",
            fillOpacity: 0.1,
            radius: radius[0] * 1000, // Convert km to meters
          }).addTo(mapInstanceRef.current)

          mapInstanceRef.current.on("click", async (e: any) => {
            const { lat, lng } = e.latlng

            console.log(`Map clicked at:`, { lat, lng })
            // Update marker position immediately for better UX
            markerRef.current.setLatLng([lat, lng])
            circleRef.current.setLatLng([lat, lng])

            // Reverse geocoding to get address
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`,
              )
              const data = await response.json()
              const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

              console.log("Geocoded address:", address)

              setSelectedLocation({ address, lat, lng })
            } catch (error) {
              console.error("Geocoding error:", error)
              setSelectedLocation({
                address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                lat,
                lng,
              })
            }
          })
        }
      }
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update circle radius when slider changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius[0] * 1000)
    }
  }, [radius])

  const selectUniversity = async (universityId: string) => {
    const university = canthoUniversities.find(uni => uni.id === universityId)
    if (!university) return

    const { lat, lng } = university.location

    // Update map view and marker
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15)
      markerRef.current.setLatLng([lat, lng])
      circleRef.current.setLatLng([lat, lng])
    }

    setSelectedLocation({ 
      address: university.address, 
      lat, 
      lng 
    })
  }

  const handleConfirm = () => {
    onLocationSelect({
      address: selectedLocation.address,
      coordinates: [selectedLocation.lat, selectedLocation.lng],
      radius: radius[0],
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
      style={{ zIndex: 99999 }}
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[98vh] relative z-[99999]"
        style={{ zIndex: 99999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-base font-semibold">Chọn vị trí tìm kiếm</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
  <div className="p-3 space-y-3 pb-24">
          {/* University Selection - larger */}
          <div className="space-y-1">
            <div className="text-xs font-semibold flex items-center gap-1 pb-1">
              <GraduationCap className="w-4 h-4" />
              Chọn trường đại học
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-20 overflow-y-auto">
              {canthoUniversities.map((university) => (
                <Button
                  key={university.id}
                  onClick={() => selectUniversity(university.id)}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-1 min-h-8"
                >
                  <div>
                    <div className="font-medium text-xs">{university.shortName}</div>
                    <div className="text-xs text-muted-foreground">{university.district}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div className="absolute top-1 left-1 bg-background/90 backdrop-blur-sm px-1 py-0.5 rounded-lg text-[10px] text-muted-foreground z-10 border">
              Nhấp vào bản đồ để chọn vị trí
            </div>
            <div
              ref={mapRef}
              className="w-full h-80 rounded-lg border cursor-crosshair relative z-10"
              style={{ minHeight: "320px" }}
            />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          </div>

          {/* Selected Address */}
          <div className="bg-muted p-2 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Địa chỉ đã chọn:</p>
                <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
              </div>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Bán kính tìm kiếm</label>
              <span className="text-sm text-muted-foreground">{radius[0]} km</span>
            </div>
            <Slider value={radius} onValueChange={setRadius} max={10} min={0.5} step={0.5} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5 km</span>
              <span>10 km</span>
            </div>
          </div>

          {/* Action Buttons - always visible at bottom */}
          <div className="flex gap-2 pt-2 px-4 pb-4 bg-background border-t absolute left-0 bottom-0 w-full z-20">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Hủy
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Xác nhận
            </Button>
          </div>
  </div>
      </div>
    </div>
  )
}
