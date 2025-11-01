import type { Roomie } from "@/types/roomie"

export const FIND_ROOMIE_LIST: Roomie[] = [
  {
    id: 1,
    name: "Ngọc Anh",
    age: 22,
    gender: "Nữ",
    occupation: "Sinh viên",
    school: "Đại học Cần Thơ",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là sinh viên năm cuối ngành Kinh tế, tính cách thân thiện, hòa đồng và dễ gần. Mình thích sự sạch sẽ, ngăn nắp và tôn trọng không gian riêng tư của nhau. Muốn tìm bạn ở ghép để cùng chia sẻ chi phí và vui vẻ hơn khi sống cùng.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Cái Răng, Cần Thơ", "Quận Bình Thủy, Cần Thơ"],
    room_type: "Căn hộ chung cư",
    budget_min: 2000000,
    budget_max: 3500000,
    preferences: ["Sạch sẽ, ngăn nắp", "Nữ", "Không hút thuốc", "Không nuôi thú cưng"],
    lifestyle: "Linh hoạt",
    additional_requirements:
      "Ưu tiên bạn cùng trường hoặc sinh viên đang học tập tại Cần Thơ. Mình thích nấu ăn nên hi vọng tìm được bạn cũng có sở thích tương tự.",
    contact_phone: "0901234567",
    contact_hours: "8:00 - 20:00",
    created_at: "2025-01-15T10:30:00Z",
    view_count: 128,
  },
  {
    id: 2,
    name: "Minh Tuấn",
    age: 25,
    gender: "Nam",
    occupation: "Đã đi làm",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là nhân viên IT, làm việc tại Quận Ninh Kiều. Tính tình hiền lành, dễ gần và rất tôn trọng không gian riêng. Tìm bạn ở ghép để tiết kiệm chi phí và có thêm người cùng chia sẻ cuộc sống.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Cái Răng, Cần Thơ", "Quận Bình Thủy, Cần Thơ"],
    room_type: "Nhà nguyên căn",
    budget_min: 2500000,
    budget_max: 4000000,
    preferences: ["Sạch sẽ", "Nam", "Không ồn ào", "Có công việc ổn định"],
    lifestyle: "Ban ngày",
    additional_requirements:
      "Ưu tiên bạn cũng đang đi làm, có thu nhập ổn định. Mình thường đi làm từ 8h-18h, tối về thích xem phim và chơi game.",
    contact_phone: "0912345678",
    contact_hours: "18:00 - 21:00",
    created_at: "2025-01-20T14:20:00Z",
    view_count: 95,
  },
  {
    id: 3,
    name: "Thanh Hà",
    age: 21,
    gender: "Nữ",
    occupation: "Sinh viên",
    school: "Đại học FPT Cần Thơ",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là sinh viên năm 2 ngành Công nghệ thông tin. Tính cách hướng nội, thích yên tĩnh để học tập. Mong muốn tìm được bạn ở ghép có tính cách tương tự để cùng nhau tạo không gian sống thoải mái.",
    preferred_areas: ["Quận Bình Thủy, Cần Thơ", "Quận Ninh Kiều, Cần Thơ"],
    room_type: "Phòng trọ",
    budget_min: 1500000,
    budget_max: 2500000,
    preferences: ["Yên tĩnh", "Nữ", "Không hút thuốc", "Học tập chăm chỉ"],
    lifestyle: "Ban đêm",
    additional_requirements:
      "Ưu tiên bạn cũng là sinh viên IT hoặc các ngành liên quan. Mình thường học muộn và code đến 1-2h sáng nên cần bạn cùng phòng thông cảm.",
    contact_phone: "0923456789",
    contact_hours: "14:00 - 22:00",
    created_at: "2025-01-18T09:15:00Z",
    view_count: 76,
  },
  {
    id: 4,
    name: "Quốc Bảo",
    age: 23,
    gender: "Nam",
    occupation: "Sinh viên",
    school: "Đại học Kỹ thuật - Công nghệ Cần Thơ",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là sinh viên năm 3, hiện đang thực tập tại một công ty startup. Tính cách năng động, thích giao lưu và hoạt động ngoài trời. Tìm bạn ở ghép có sở thích tương tự để cùng nhau tạo không gian sống vui vẻ.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Cái Răng, Cần Thơ", "Quận Bình Thủy, Cần Thơ"],
    room_type: "Căn hộ chung cư",
    budget_min: 2000000,
    budget_max: 3500000,
    preferences: ["Năng động", "Nam", "Thích thể thao", "Không hút thuốc trong phòng"],
    lifestyle: "Linh hoạt",
    additional_requirements:
      "Mình thích chơi bóng đá và gym vào cuối tuần. Hi vọng tìm được bạn cùng sở thích để đi tập cùng.",
    contact_phone: "0934567890",
    contact_hours: "9:00 - 21:00",
    created_at: "2025-01-22T11:45:00Z",
    view_count: 112,
  },
  {
    id: 5,
    name: "Lan Anh",
    age: 24,
    gender: "Nữ",
    occupation: "Đã đi làm",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình làm việc trong ngành Marketing, thường xuyên phải làm việc linh hoạt cả sáng lẫn tối. Tính cách cởi mở, thân thiện nhưng cũng rất trân trọng không gian riêng tư. Muốn tìm bạn ở ghép có tính cách tương đồng.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Cái Răng, Cần Thơ"],
    room_type: "Căn hộ chung cư",
    budget_min: 2500000,
    budget_max: 4000000,
    preferences: ["Sạch sẽ", "Nữ", "Có công việc ổn định", "Trách nhiệm"],
    lifestyle: "Linh hoạt",
    additional_requirements:
      "Ưu tiên bạn đã đi làm, có lối sống lành mạnh. Mình thích yoga và healthy lifestyle.",
    contact_phone: "0945678901",
    contact_hours: "19:00 - 22:00",
    created_at: "2025-01-19T16:30:00Z",
    view_count: 89,
  },
  {
    id: 6,
    name: "Văn Khoa",
    age: 26,
    gender: "Nam",
    occupation: "Đã đi làm",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là kỹ sư xây dựng, làm việc tại các công trình ở Cần Thơ. Tính cách điềm tĩnh, có trách nhiệm và rất sạch sẽ. Tìm bạn ở ghép để chia sẻ chi phí và có thêm người cùng trò chuyện sau giờ làm việc.",
    preferred_areas: ["Quận Ô Môn, Cần Thơ", "Quận Bình Thủy, Cần Thơ", "Quận Ninh Kiều, Cần Thơ"],
    room_type: "Nhà nguyên căn",
    budget_min: 2000000,
    budget_max: 3500000,
    preferences: ["Trách nhiệm", "Nam", "Không hút thuốc", "Có công việc ổn định"],
    lifestyle: "Ban ngày",
    additional_requirements:
      "Ưu tiên bạn đã đi làm, có tính kỷ luật và ý thức giữ gìn không gian chung. Mình không thích ồn ào và tiệc tùng.",
    contact_phone: "0956789012",
    contact_hours: "18:00 - 20:00",
    created_at: "2025-01-17T13:20:00Z",
    view_count: 67,
  },
  {
    id: 7,
    name: "Thu Trang",
    age: 20,
    gender: "Nữ",
    occupation: "Sinh viên",
    school: "Đại học Nam Cần Thơ",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là sinh viên năm 1, mới từ tỉnh khác đến Cần Thơ học. Tính cách hiền lành, dễ thương và rất biết quan tâm người khác. Tìm bạn ở ghép để có người hỗ trợ nhau trong cuộc sống mới.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Cái Răng, Cần Thơ"],
    room_type: "Phòng trọ",
    budget_min: 1200000,
    budget_max: 2000000,
    preferences: ["Thân thiện", "Nữ", "Không hút thuốc", "Giúp đỡ lẫn nhau"],
    lifestyle: "Linh hoạt",
    additional_requirements:
      "Ưu tiên bạn cũng là sinh viên mới hoặc người tốt bụng, dễ gần. Mình chưa quen Cần Thơ lắm nên cần người chỉ dẫn.",
    contact_phone: "0967890123",
    contact_hours: "8:00 - 22:00",
    created_at: "2025-01-21T10:00:00Z",
    view_count: 142,
  },
  {
    id: 8,
    name: "Hoàng Long",
    age: 27,
    gender: "Nam",
    occupation: "Đã đi làm",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình làm trong lĩnh vực tài chính ngân hàng, có lịch làm việc cố định từ thứ 2 đến thứ 6. Tính cách ổn định, có trách nhiệm và rất tôn trọng quy tắc chung. Muốn tìm bạn ở ghép để chia sẻ không gian sống và tiết kiệm chi phí.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Cái Răng, Cần Thơ"],
    room_type: "Căn hộ chung cư",
    budget_min: 2500000,
    budget_max: 4500000,
    preferences: ["Sạch sẽ", "Nam", "Có thu nhập ổn định", "Trách nhiệm"],
    lifestyle: "Ban ngày",
    additional_requirements:
      "Ưu tiên bạn đã có công việc ổn định trong các lĩnh vực văn phòng. Mình thích sự yên tĩnh và trật tự.",
    contact_phone: "0978901234",
    contact_hours: "19:00 - 21:00",
    created_at: "2025-01-16T15:40:00Z",
    view_count: 103,
  },
  {
    id: 9,
    name: "Phương Anh",
    age: 23,
    gender: "Nữ",
    occupation: "Đã đi làm",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là giáo viên mầm non, làm việc tại Quận Ninh Kiều. Tính cách vui vẻ, năng động và rất yêu thích trẻ con. Muốn tìm bạn ở ghép có tính cách tích cực để cùng nhau tạo không gian sống vui vẻ.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Bình Thủy, Cần Thơ", "Quận Cái Răng, Cần Thơ"],
    room_type: "Nhà nguyên căn",
    budget_min: 1800000,
    budget_max: 3000000,
    preferences: ["Vui vẻ", "Nữ", "Không hút thuốc", "Yêu động vật"],
    lifestyle: "Ban ngày",
    additional_requirements:
      "Ưu tiên bạn cũng làm trong ngành giáo dục hoặc có tính cách nhẹ nhàng, dễ gần. Mình có nuôi 1 con mèo nên hi vọng bạn cùng phòng yêu động vật.",
    contact_phone: "0989012345",
    contact_hours: "17:00 - 20:00",
    created_at: "2025-01-23T08:30:00Z",
    view_count: 87,
  },
  {
    id: 10,
    name: "Đức Anh",
    age: 22,
    gender: "Nam",
    occupation: "Sinh viên",
    school: "Đại học Y Dược Cần Thơ",
    avatar: "/images/mock-findroomie/placeholder-user.jpg",
    description:
      "Mình là sinh viên năm 3 ngành Công nghệ thông tin, đang thực tập part-time. Tính cách hướng ngoại, thích giao lưu và làm việc nhóm. Tìm bạn ở ghép có cùng ngành nghề để cùng nhau học hỏi và phát triển.",
    preferred_areas: ["Quận Ninh Kiều, Cần Thơ", "Quận Bình Thủy, Cần Thơ", "Quận Cái Răng, Cần Thơ"],
    room_type: "Căn hộ chung cư",
    budget_min: 2000000,
    budget_max: 3000000,
    preferences: ["Năng động", "Nam", "Cùng ngành IT", "Thích học hỏi"],
    lifestyle: "Linh hoạt",
    additional_requirements:
      "Ưu tiên bạn cùng ngành IT hoặc các ngành công nghệ. Mình thích làm side project và thích tổ chức hackathon.",
    contact_phone: "0990123456",
    contact_hours: "10:00 - 22:00",
    created_at: "2025-01-24T12:15:00Z",
    view_count: 118,
  },
]

// Helper function để lọc roomies theo filter
export function filterRoomies(roomies: Roomie[], filters: Record<string, any>): Roomie[] {
  return roomies.filter((roomie) => {
    // Filter theo giá
    if (filters.min_price && roomie.budget_max < filters.min_price) return false
    if (filters.max_price && roomie.budget_min > filters.max_price) return false

    // Filter theo tuổi
    if (filters.min_age && roomie.age < filters.min_age) return false
    if (filters.max_age && roomie.age > filters.max_age) return false

    // Filter theo giới tính
    if (filters.gender && roomie.gender !== filters.gender) return false

    // Filter theo nghề nghiệp
    if (filters.occupation && roomie.occupation !== filters.occupation) return false

    // Filter theo trường (nếu là sinh viên)
    if (filters.school && roomie.school && !roomie.school.toLowerCase().includes(filters.school.toLowerCase())) {
      return false
    }

    // Filter theo lifestyle
    if (filters.lifestyle && roomie.lifestyle !== filters.lifestyle) return false

    // Filter theo khu vực mong muốn
    if (filters.preferred_area) {
      const hasMatchingArea = roomie.preferred_areas.some((area) =>
        area.toLowerCase().includes(filters.preferred_area.toLowerCase())
      )
      if (!hasMatchingArea) return false
    }

    // Filter theo loại phòng
    if (filters.room_type && !roomie.room_type.toLowerCase().includes(filters.room_type.toLowerCase())) {
      return false
    }

    // Filter theo từ khóa tìm kiếm
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchName = roomie.name.toLowerCase().includes(searchLower)
      const matchDescription = roomie.description.toLowerCase().includes(searchLower)
      const matchPreferences = roomie.preferences.some((pref) => pref.toLowerCase().includes(searchLower))
      if (!matchName && !matchDescription && !matchPreferences) return false
    }

    return true
  })
}

// Helper function để sort roomies
export function sortRoomies(roomies: Roomie[], sortBy: string = "-created_at"): Roomie[] {
  const sorted = [...roomies]

  switch (sortBy) {
    case "age":
      return sorted.sort((a, b) => a.age - b.age)
    case "-age":
      return sorted.sort((a, b) => b.age - a.age)
    case "budget":
      return sorted.sort((a, b) => a.budget_min - b.budget_min)
    case "-budget":
      return sorted.sort((a, b) => b.budget_max - a.budget_max)
    case "created_at":
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case "-created_at":
    default:
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}
