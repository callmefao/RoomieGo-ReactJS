import type { Room, RoomAmenityDetail } from "@/types/room"
import { generateRentalImages, type RentalImages } from "@/lib/utils/image-loader"
import { convertVietnameseToUrlFriendly } from "@/lib/utils/vietnamese"

// Interface cho RentalItem (dùng trong RentalListings)
export interface RentalItem {
  id: number
  name: string
  price: string
  address: string
  image: string
}

// Interface cho RentalData (dùng trong trang detail)
export interface RentalData {
  id: string
  name: string
  price: string
  address: string
  description: string
  amenities?: string[]
  amenities_detail?: RoomAmenityDetail[]
  contact: {
    phone: string
    zalo: string
  }
  images: RentalImages
  location: {
    lat: number
    lng: number
  }
}

const createAmenityDetails = (names: string[]): RoomAmenityDetail[] =>
  names.map((name, index) => ({
    id: index + 1,
    name,
    slug: convertVietnameseToUrlFriendly(name),
  }))

// Mock data cho SuggestedRooms (homepage)
export const mockRooms: Room[] = [
  {
    id: 1,
    title: "Phòng trọ Quận Cái Răng",
    price: 2500000,
    location: "Quận Cái Răng, Cần Thơ",
    area: 25,
  main_image_url: "/rental-images/1/rooms/room-1.jpg",
  images: [],
  latitude: "10.0452",
  longitude: "105.7469",
  status: 1,
  has_mezzanine: true,
    amenities: ["Máy lạnh", "WiFi", "Máy giặt"],
    amenities_detail: createAmenityDetails(["Máy lạnh", "WiFi", "Máy giặt"]),
  },
  {
    id: 2,
    title: "Nhà trọ Ninh Kiều",
    price: 3000000,
    location: "Ninh Kiều, Cần Thơ",
    area: 30,
  main_image_url: "/rental-images/2/rooms/room-1.jpg",
  images: [],
  latitude: "10.0352",
  longitude: "105.7569",
  status: 1,
  has_mezzanine: false,
    amenities: ["Bếp riêng", "Ban công", "An ninh 24/7"],
    amenities_detail: createAmenityDetails(["Bếp riêng", "Ban công", "An ninh 24/7"]),
  },
  {
    id: 3,
    title: "Phòng trọ Bình Thủy",
    price: 2200000,
    location: "Bình Thủy, Cần Thơ",
    area: 20,
  main_image_url: "/rental-images/3/rooms/room-1.jpg",
  images: [],
  latitude: "10.0252",
  longitude: "105.7669",
  status: 1,
  has_mezzanine: true,
  amenities: ["Gần trường học", "Giá rẻ", "Tiện ích đầy đủ"],
  amenities_detail: createAmenityDetails(["Gần trường học", "Giá rẻ", "Tiện ích đầy đủ"]),
  },
  {
    id: 4,
    title: "Nhà trọ Ô Môn",
    price: 1800000,
    location: "Ô Môn, Cần Thơ",
    area: 40,
  main_image_url: "/rental-images/4/rooms/room-1.jpg",
  images: [],
  latitude: "10.0152",
  longitude: "105.7769",
  status: 1,
  has_mezzanine: false,
  amenities: ["Hồ bơi", "Gym", "Dọn phòng"],
  amenities_detail: createAmenityDetails(["Hồ bơi", "Gym", "Dọn phòng"]),
  },
  {
    id: 5,
    title: "Phòng trọ Thốt Nốt",
    price: 2100000,
    location: "Thốt Nốt, Cần Thơ",
    area: 35,
  main_image_url: "/rental-images/5/rooms/room-1.jpg",
  images: [],
  latitude: "10.0052",
  longitude: "105.7869",
  status: 1,
  has_mezzanine: true,
  amenities: ["2 phòng ngủ", "Phòng khách", "Bếp chung"],
  amenities_detail: createAmenityDetails(["2 phòng ngủ", "Phòng khách", "Bếp chung"]),
  },
  {
    id: 6,
    title: "Nhà trọ Cờ Đỏ",
    price: 2800000,
    location: "Cờ Đỏ, Cần Thơ",
    area: 28,
  main_image_url: "/rental-images/6/rooms/room-1.jpg",
  images: [],
  latitude: "9.9952",
  longitude: "105.7969",
  status: 1,
  has_mezzanine: false,
  amenities: ["Nội thất cao cấp", "View đẹp", "Gần metro"],
  amenities_detail: createAmenityDetails(["Nội thất cao cấp", "View đẹp", "Gần metro"]),
  },
  {
    id: 7,
    title: "Phòng trọ Vĩnh Thạnh",
    price: 2300000,
    location: "Vĩnh Thạnh, Cần Thơ",
    area: 22,
  main_image_url: "/rental-images/7/rooms/room-1.jpg",
  images: [],
  latitude: "9.9852",
  longitude: "105.8069",
  status: 1,
  has_mezzanine: true,
  amenities: ["Máy lạnh", "Wifi riêng", "Bãi xe rộng"],
  amenities_detail: createAmenityDetails(["Máy lạnh", "Wifi riêng", "Bãi xe rộng"]),
  },
  {
    id: 8,
    title: "Nhà trọ Phong Điền",
    price: 2600000,
    location: "Phong Điền, Cần Thơ",
    area: 32,
  main_image_url: "/rental-images/8/rooms/room-1.jpg",
  images: [],
  latitude: "9.9752",
  longitude: "105.8169",
  status: 1,
  has_mezzanine: true,
  amenities: ["Máy giặt", "Wifi riêng", "An ninh tốt"],
  amenities_detail: createAmenityDetails(["Máy giặt", "Wifi riêng", "An ninh tốt"]),
  },
  {
    id: 9,
    title: "Phòng trọ Thới Lai",
    price: 1900000,
    location: "Thới Lai, Cần Thơ",
    area: 18,
  main_image_url: "/rental-images/9/rooms/room-1.jpg",
  images: [],
  latitude: "9.9652",
  longitude: "105.8269",
  status: 1,
  has_mezzanine: false,
  amenities: ["Giá rẻ", "Gần chợ", "Tiện lợi"],
  amenities_detail: createAmenityDetails(["Giá rẻ", "Gần chợ", "Tiện lợi"]),
  },
  {
    id: 10,
    title: "Nhà trọ Cái Răng 2",
    price: 2700000,
    location: "Cái Răng, Cần Thơ",
    area: 26,
  main_image_url: "/rental-images/10/rooms/room-1.jpg",
  images: [],
  latitude: "9.9552",
  longitude: "105.8369",
  status: 1,
  has_mezzanine: true,
  amenities: ["Máy lạnh", "Wifi riêng", "Thang máy"],
  amenities_detail: createAmenityDetails(["Máy lạnh", "Wifi riêng", "Thang máy"]),
  },
]

// Convert Room data to RentalItem format
export const mockRentalItems: RentalItem[] = mockRooms.map((room) => ({
  id: room.id,
  name: room.title,
  price: new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(room.price),
  address: `123 Đường ${room.location}`,
  image: room.main_image_url ?? "/images/placeholder-room.jpg",
}))

// Helper function to create rental data with auto-generated images
function createRentalData(
  id: string,
  name: string,
  price: string,
  address: string,
  description: string,
  amenities: string[],
  phone: string,
  lat: number,
  lng: number
): RentalData {
  return {
    id,
    name,
    price,
    address,
    description,
  amenities,
  amenities_detail: createAmenityDetails(amenities),
    contact: {
      phone,
      zalo: phone,
    },
    images: generateRentalImages(id),
    location: { lat, lng },
  }
}

// Detailed rental data for individual pages
export const mockRentalData: Record<string, RentalData> = {
  "1": createRentalData(
    "1",
    "Phòng trọ Quận Cái Răng",
    "2.500.000 VND",
    "123 Đường Cái Răng, Quận Cái Răng, Cần Thơ",
    "Phòng trọ đầy đủ tiện nghi, gần trường học và chợ. Môi trường an toàn, sạch sẽ.",
    ["Máy lạnh", "Máy giặt", "Wifi riêng"],
    "0123456789",
    10.0452,
    105.7469
  ),
  "2": createRentalData(
    "2",
    "Nhà trọ Ninh Kiều",
    "3.000.000 VND",
    "456 Đường Ninh Kiều, Cần Thơ",
    "Nhà trọ cao cấp, đầy đủ tiện nghi hiện đại.",
    ["Máy lạnh", "Máy giặt", "Wifi riêng", "Bếp riêng"],
    "0123456790",
    10.0352,
    105.7569
  ),
  "3": createRentalData(
    "3",
    "Phòng trọ Bình Thủy",
    "2.200.000 VND",
    "789 Đường Bình Thủy, Cần Thơ",
    "Phòng trọ giá rẻ, tiện nghi cơ bản, phù hợp sinh viên.",
    ["Máy lạnh", "Wifi chung"],
    "0123456791",
    10.0252,
    105.7669
  ),
  "4": createRentalData(
    "4",
    "Nhà trọ Ô Môn",
    "1.800.000 VND",
    "321 Đường Ô Môn, Cần Thơ",
    "Nhà trọ bình dân, giá cả hợp lý.",
    ["Quạt trần", "Wifi chung"],
    "0123456792",
    10.0152,
    105.7769
  ),
  "5": createRentalData(
    "5",
    "Phòng trọ Thốt Nốt",
    "2.100.000 VND",
    "654 Đường Thốt Nốt, Cần Thơ",
    "Phòng trọ yên tĩnh, gần chợ và trường học.",
    ["Máy lạnh", "Wifi riêng"],
    "0123456793",
    10.0052,
    105.7869
  ),
  "6": createRentalData(
    "6",
    "Nhà trọ Cờ Đỏ",
    "2.800.000 VND",
    "987 Đường Cờ Đỏ, Cần Thơ",
    "Nhà trọ mới xây, tiện nghi hiện đại.",
    ["Máy lạnh", "Máy giặt", "Wifi riêng", "Thang máy"],
    "0123456794",
    9.9952,
    105.7969
  ),
  "7": createRentalData(
    "7",
    "Phòng trọ Vĩnh Thạnh",
    "2.300.000 VND",
    "111 Đường Vĩnh Thạnh, Cần Thơ",
    "Phòng trọ thoáng mát, môi trường xanh sạch.",
    ["Máy lạnh", "Wifi riêng", "Bãi xe rộng"],
    "0123456795",
    9.9852,
    105.8069
  ),
  "8": createRentalData(
    "8",
    "Nhà trọ Phong Điền",
    "2.600.000 VND",
    "222 Đường Phong Điền, Cần Thơ",
    "Nhà trọ hiện đại, đầy đủ tiện nghi.",
    ["Máy lạnh", "Máy giặt", "Wifi riêng"],
    "0123456796",
    9.9752,
    105.8169
  ),
  "9": createRentalData(
    "9",
    "Phòng trọ Thới Lai",
    "1.900.000 VND",
    "333 Đường Thới Lai, Cần Thơ",
    "Phòng trọ giá rẻ, phù hợp sinh viên.",
    ["Quạt trần", "Wifi chung"],
    "0123456797",
    9.9652,
    105.8269
  ),
  "10": createRentalData(
    "10",
    "Nhà trọ Cái Răng 2",
    "2.700.000 VND",
    "444 Đường Cái Răng, Cần Thơ",
    "Nhà trọ cao cấp với đầy đủ tiện nghi.",
    ["Máy lạnh", "Máy giặt", "Wifi riêng", "Thang máy"],
    "0123456798",
    9.9552,
    105.8369
  ),
}