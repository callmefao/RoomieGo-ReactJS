import type { TransportService, TransportFilters } from "@/types/transport"

// Mock data cho dịch vụ vận chuyển tại Cần Thơ
export const TRANSPORT_SERVICES: TransportService[] = [
  {
    id: 1,
    name: "Vận chuyển Minh Phát",
    phone: "0901234567",
    zalo: "0901234567",
    messenger: "vanchuyenminhphat",
    vehicle_types: ["Ba gác", "Tải 0.5 tấn"],
    goods_supported: ["Thùng đồ", "Xe máy", "Hàng cồng kềnh"],
    operating_areas: ["Ninh Kiều", "Cái Răng", "Bình Thủy"],
    price_per_km: 15000,
    price_type: "per_km",
    rating: 4.8,
    total_reviews: 156,
    description: "Dịch vụ vận chuyển uy tín tại Cần Thơ với đội ngũ tài xế chuyên nghiệp, phục vụ 24/7. Chuyên chở đồ dọn nhà, xe máy, hàng hóa nhỏ. Giá cả hợp lý, cam kết bảo quản hàng hóa an toàn.",
    image: "/images/mock-findroomie/avatar-1.jpg",
    available_hours: "24/7",
    experience_years: 8,
  },
  {
    id: 2,
    name: "Taxi tải Cần Thơ",
    phone: "0912345678",
    zalo: "0912345678",
    vehicle_types: ["Tải 1 tấn", "Tải 2 tấn"],
    goods_supported: ["Máy giặt", "Máy lạnh", "Tủ lạnh", "Hàng điện tử"],
    operating_areas: ["Ninh Kiều", "Cái Răng", "Ô Môn", "Thốt Nốt"],
    price_per_trip: 300000,
    price_type: "per_trip",
    rating: 4.9,
    total_reviews: 234,
    description: "Chuyên vận chuyển đồ điện tử, điện máy với kinh nghiệm 10 năm. Đội xe tải 1-2 tấn hiện đại, có bảo hiểm hàng hóa. Nhân viên chuyên nghiệp, bốc xếp cẩn thận. Phục vụ cả nội thành và liên tỉnh.",
    image: "/images/mock-findroomie/avatar-2.jpg",
    available_hours: "6:00 - 22:00",
    experience_years: 10,
  },
  {
    id: 3,
    name: "Chành xe Hùng Vương",
    phone: "0923456789",
    messenger: "chanhxehungvuong",
    vehicle_types: ["Tải 2 tấn", "Bán tải"],
    goods_supported: ["Thùng đồ", "Hàng cồng kềnh", "Hàng dễ vỡ"],
    operating_areas: ["Ninh Kiều", "Cái Răng", "Bình Thủy", "Ô Môn"],
    price_per_km: 20000,
    price_type: "per_km",
    rating: 4.7,
    total_reviews: 189,
    description: "Dịch vụ vận chuyển hàng hóa chuyên nghiệp, chuyên chở hàng dễ vỡ, hàng cồng kềnh. Xe tải đời mới, có thùng mui kín bảo vệ hàng khỏi mưa nắng. Tài xế giàu kinh nghiệm, thái độ phục vụ tốt.",
    image: "/images/mock-findroomie/avatar-3.jpg",
    available_hours: "5:00 - 20:00",
    experience_years: 12,
  },
  {
    id: 4,
    name: "Ba gác Thanh Tâm",
    phone: "0934567890",
    zalo: "0934567890",
    vehicle_types: ["Ba gác"],
    goods_supported: ["Thùng đồ", "Xe máy"],
    operating_areas: ["Ninh Kiều", "Bình Thủy"],
    price_per_trip: 100000,
    price_type: "per_trip",
    rating: 4.5,
    total_reviews: 98,
    description: "Dịch vụ ba gác chuyên chở đồ trong nội thành Cần Thơ. Giá rẻ, phù hợp cho sinh viên và người lao động. Chủ động liên hệ nhanh, đúng giờ hẹn. Phục vụ nhiệt tình, giúp bốc xếp đồ.",
    image: "/images/mock-findroomie/avatar-4.jpg",
    available_hours: "6:00 - 21:00",
    experience_years: 5,
  },
  {
    id: 5,
    name: "Vận tải Phương Nam",
    phone: "0945678901",
    zalo: "0945678901",
    messenger: "vantaiphuongnam",
    vehicle_types: ["Tải 1 tấn", "Tải 2 tấn", "Bán tải"],
    goods_supported: ["Máy giặt", "Máy lạnh", "Tủ lạnh", "Hàng điện tử", "Hàng cồng kềnh"],
    operating_areas: ["Ninh Kiều", "Cái Răng", "Bình Thủy", "Ô Môn", "Thốt Nốt", "Vĩnh Thạnh"],
    price_per_km: 18000,
    price_type: "per_km",
    rating: 5.0,
    total_reviews: 312,
    description: "Công ty vận tải uy tín hàng đầu Cần Thơ với hơn 15 năm kinh nghiệm. Đội xe đa dạng, phục vụ mọi nhu cầu vận chuyển. Có bảo hiểm hàng hóa, cam kết bồi thường 100% nếu có sự cố. Nhân viên được đào tạo chuyên nghiệp.",
    image: "/images/mock-findroomie/avatar-5.jpg",
    available_hours: "24/7",
    experience_years: 15,
  },
  {
    id: 6,
    name: "Xe tải Hoàng Anh",
    phone: "0956789012",
    zalo: "0956789012",
    vehicle_types: ["Tải 0.5 tấn", "Tải 1 tấn"],
    goods_supported: ["Thùng đồ", "Xe máy", "Hàng điện tử"],
    operating_areas: ["Cái Răng", "Ô Môn", "Thốt Nốt"],
    price_per_trip: 250000,
    price_type: "per_trip",
    rating: 4.6,
    total_reviews: 142,
    description: "Dịch vụ vận chuyển giá rẻ cho sinh viên và người lao động. Chuyên chở đồ dọn nhà, xe máy trong nội thành. Xe sạch sẽ, tài xế thân thiện. Linh động về thời gian, có thể đặt trước hoặc gọi gấp.",
    image: "/images/mock-findroomie/avatar-6.jpg",
    available_hours: "7:00 - 19:00",
    experience_years: 6,
  },
  {
    id: 7,
    name: "Vận chuyển Đại Phát",
    phone: "0967890123",
    messenger: "vanchuyen.daiphat",
    vehicle_types: ["Bán tải", "Tải 2 tấn"],
    goods_supported: ["Hàng cồng kềnh", "Hàng dễ vỡ", "Máy lạnh", "Tủ lạnh"],
    operating_areas: ["Ninh Kiều", "Cái Răng", "Bình Thủy", "Ô Môn"],
    price_per_km: 22000,
    price_type: "per_km",
    rating: 4.8,
    total_reviews: 201,
    description: "Chuyên vận chuyển hàng nặng, hàng cồng kềnh với thiết bị nâng hạ hiện đại. Đội ngũ bốc xếp chuyên nghiệp, cẩn thận. Xe có mui kín, bảo vệ hàng tốt. Phục vụ cả vận chuyển liên tỉnh.",
    image: "/images/mock-findroomie/avatar-7.jpg",
    available_hours: "6:00 - 22:00",
    experience_years: 9,
  },
  {
    id: 8,
    name: "Ba gác Tuấn Kiệt",
    phone: "0978901234",
    zalo: "0978901234",
    vehicle_types: ["Ba gác"],
    goods_supported: ["Thùng đồ"],
    operating_areas: ["Ninh Kiều", "Cái Răng"],
    price_per_trip: 80000,
    price_type: "per_trip",
    rating: 4.4,
    total_reviews: 76,
    description: "Ba gác chở đồ giá rẻ nhất Cần Thơ. Phù hợp cho sinh viên dọn phòng trọ, chở đồ nhỏ trong nội thành. Chủ nhiệt tình, sẵn sàng giúp đỡ khách hàng. Có thể đặt lịch trước hoặc gọi gấp.",
    image: "/images/mock-findroomie/avatar-8.jpg",
    available_hours: "6:00 - 20:00",
    experience_years: 4,
  },
  {
    id: 9,
    name: "Vận tải Thành Đạt",
    phone: "0989012345",
    zalo: "0989012345",
    messenger: "vantaithandat.ct",
    vehicle_types: ["Tải 1 tấn", "Tải 2 tấn"],
    goods_supported: ["Máy giặt", "Máy lạnh", "Tủ lạnh", "Hàng điện tử", "Thùng đồ"],
    operating_areas: ["Ninh Kiều", "Bình Thủy", "Ô Môn", "Thốt Nốt", "Vĩnh Thạnh"],
    price_per_km: 17000,
    price_type: "per_km",
    rating: 4.9,
    total_reviews: 267,
    description: "Dịch vụ vận chuyển chuyên nghiệp với đội xe hiện đại, GPS theo dõi hành trình. Nhân viên được đào tạo về kỹ thuật bốc xếp, vận chuyển an toàn. Có hợp đồng và hóa đơn VAT cho doanh nghiệp.",
    image: "/images/mock-findroomie/avatar-9.jpg",
    available_hours: "24/7",
    experience_years: 11,
  },
  {
    id: 10,
    name: "Xe tải Bảo Long",
    phone: "0990123456",
    vehicle_types: ["Tải 0.5 tấn", "Bán tải"],
    goods_supported: ["Xe máy", "Thùng đồ", "Hàng điện tử", "Hàng dễ vỡ"],
    operating_areas: ["Cái Răng", "Bình Thủy", "Ô Môn"],
    price_per_trip: 200000,
    price_type: "per_trip",
    rating: 4.7,
    total_reviews: 128,
    description: "Chuyên vận chuyển xe máy và hàng dễ vỡ với kinh nghiệm 7 năm. Xe có thùng kín, neo chặt hàng cẩn thận. Tài xế lái xe êm, không nhanh quá. Giá cả phải chăng, phục vụ tận tâm.",
    image: "/images/mock-findroomie/avatar-10.jpg",
    available_hours: "7:00 - 21:00",
    experience_years: 7,
  },
]

// Helper function: Lọc dịch vụ theo filters
export function filterTransportServices(
  services: TransportService[],
  filters: TransportFilters
): TransportService[] {
  return services.filter((service) => {
    // Filter by areas
    if (filters.areas && filters.areas.length > 0) {
      const hasMatchingArea = filters.areas.some((area) =>
        service.operating_areas.includes(area)
      )
      if (!hasMatchingArea) return false
    }

    // Filter by vehicle types
    if (filters.vehicle_types && filters.vehicle_types.length > 0) {
      const hasMatchingVehicle = filters.vehicle_types.some((type) =>
        service.vehicle_types.includes(type)
      )
      if (!hasMatchingVehicle) return false
    }

    // Filter by goods types
    if (filters.goods_types && filters.goods_types.length > 0) {
      const hasMatchingGoods = filters.goods_types.some((type) =>
        service.goods_supported.includes(type)
      )
      if (!hasMatchingGoods) return false
    }

    // Filter by price
    if (filters.price_type && service.price_type === filters.price_type) {
      const price =
        service.price_type === "per_km"
          ? service.price_per_km
          : service.price_per_trip

      if (price) {
        if (filters.price_min && price < filters.price_min) return false
        if (filters.price_max && price > filters.price_max) return false
      }
    }

    // Filter by rating
    if (filters.rating_min && service.rating < filters.rating_min) {
      return false
    }

    return true
  })
}

// Helper function: Sắp xếp dịch vụ
export function sortTransportServices(
  services: TransportService[],
  sortBy: "rating" | "reviews" | "price_low" | "price_high" | "experience"
): TransportService[] {
  return [...services].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "reviews":
        return b.total_reviews - a.total_reviews
      case "experience":
        return b.experience_years - a.experience_years
      case "price_low": {
        const priceA = a.price_per_km || a.price_per_trip || 0
        const priceB = b.price_per_km || b.price_per_trip || 0
        return priceA - priceB
      }
      case "price_high": {
        const priceA = a.price_per_km || a.price_per_trip || 0
        const priceB = b.price_per_km || b.price_per_trip || 0
        return priceB - priceA
      }
      default:
        return 0
    }
  })
}
