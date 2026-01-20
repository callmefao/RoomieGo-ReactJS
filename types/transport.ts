// Types cho tính năng Tìm dịch vụ vận chuyển

export type VehicleType = "Ba gác" | "Tải 0.5 tấn" | "Tải 1 tấn" | "Tải 2 tấn" | "Bán tải"

export type GoodsType = 
  | "Thùng đồ"
  | "Xe máy"
  | "Máy giặt"
  | "Máy lạnh"
  | "Tủ lạnh"
  | "Hàng cồng kềnh"
  | "Hàng dễ vỡ"
  | "Hàng điện tử"

export type PriceType = "per_km" | "per_trip"

export interface TransportService {
  id: number
  name: string
  phone: string
  zalo?: string
  messenger?: string
  vehicle_types: VehicleType[]
  goods_supported: GoodsType[]
  operating_areas: string[] // Khu vực hoạt động (quận/huyện)
  price_per_km?: number // Giá/km
  price_per_trip?: number // Giá/chuyến
  price_type: PriceType
  rating: number // 1-5
  total_reviews: number
  description: string
  image: string
  available_hours: string // Giờ hoạt động
  experience_years: number // Số năm kinh nghiệm
}

export interface TransportFilters {
  areas?: string[]
  vehicle_types?: VehicleType[]
  goods_types?: GoodsType[]
  price_min?: number
  price_max?: number
  price_type?: PriceType
  rating_min?: number
}
