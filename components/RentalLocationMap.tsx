"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface RentalLocationMapProps {
  location: {
    lat: number
    lng: number
  }
  address: string
  rentalName: string
}

export default function RentalLocationMap({ location, address, rentalName }: RentalLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet dynamically để tránh SSR issues với Next.js
    const loadMap = async () => {
      if (typeof window !== "undefined") {
        const L = (await import("leaflet")).default

        // Fix cho default markers (bug phổ biến của Leaflet với Next.js)
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        if (mapRef.current && !mapInstanceRef.current) {
          // Khởi tạo map tập trung vào vị trí phòng trọ
          mapInstanceRef.current = L.map(mapRef.current).setView([location.lat, location.lng], 15)

          // Thêm tile layer (sử dụng OpenStreetMap - miễn phí)
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstanceRef.current)

          // Thêm marker với popup thông tin
          const marker = L.marker([location.lat, location.lng]).addTo(mapInstanceRef.current)
          
          // Popup với thông tin phòng trọ (HTML styled)
          marker.bindPopup(`
            <div style="text-align: center; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: hsl(var(--primary));">${rentalName}</h3>
              <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.4;">${address}</p>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                <small style="color: #888;">📍 Click để mở Google Maps</small>
              </div>
            </div>
          `).openPopup()

          // Thêm circle để highlight khu vực (bán kính 200m)
          L.circle([location.lat, location.lng], {
            color: "hsl(var(--primary))",
            fillColor: "hsl(var(--primary))",
            fillOpacity: 0.15,
            radius: 200,
          }).addTo(mapInstanceRef.current)

          // Click handler - mở Google Maps khi click marker
          marker.on('click', () => {
            const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`
            window.open(googleMapsUrl, '_blank')
          })
        }
      }
    }

    loadMap()

    // Cleanup khi component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [location.lat, location.lng, address, rentalName])

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-80 rounded-lg border shadow-md"
          style={{ minHeight: "320px" }}
        />
        {/* CSS cho Leaflet - load qua CDN */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </div>

      {/* Location Info Card với các tính năng bổ sung */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
          <div className="space-y-1 flex-1">
            <h4 className="font-medium text-foreground">{rentalName}</h4>
            <p className="text-sm text-muted-foreground">{address}</p>
            <p className="text-xs text-muted-foreground">
              Tọa độ: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')}
              >
                📱 Mở Google Maps
              </button>
              <button 
                className="text-xs bg-green-500/10 text-green-700 px-3 py-1 rounded-full hover:bg-green-500/20 transition-colors cursor-pointer"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank')}
              >
                🧭 Chỉ đường
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lưu ý cho người dùng */}
      <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600">⚠️</span>
          <div>
            <strong className="text-yellow-700 dark:text-yellow-400">Lưu ý:</strong>
            <span className="ml-1">
              Vị trí trên bản đồ có thể sai lệch 10-50m so với thực tế. 
              Vui lòng liên hệ chủ nhà để được hướng dẫn chi tiết về đường đi và vị trí chính xác.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}