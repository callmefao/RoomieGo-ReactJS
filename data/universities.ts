/**
 * Dữ liệu các trường đại học tại Thành phố Cần Thơ
 * Để hỗ trợ tìm kiếm phòng trọ gần trường học
 */

export interface University {
  id: string
  name: string
  shortName: string
  location: {
    lat: number
    lng: number
  }
  address: string
  district: string
}

export const canthoUniversities: University[] = [
  {
    id: 'fptu-ct',
    name: 'Đại học FPT Cần Thơ',
    shortName: 'ĐH FPT CT',
    location: {
      lat: 10.0125123,
      lng: 105.7323177
    },
    address: '600 Nguyễn Văn Cừ Nối Dài, An Bình, Bình Thủy, Cần Thơ 900000, Vietnam',
    district: 'Ninh Kiều'
  },
  {
    id: 'ctu',
    name: 'Đại học Cần Thơ',
    shortName: 'ĐH Cần Thơ',
    location: {
      lat: 10.0302,
      lng: 105.7703
    },
    address: 'Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều',
    district: 'Ninh Kiều'
  },
  {
    id: 'nam-can-tho-uni',
    name: 'Trường Đại học Nam Cần Thơ',
    shortName: 'ĐH Nam CT',
    location: {
      lat: 10.0050365,
      lng: 105.72315660
    },
    address: '168 Nguyễn Văn Cừ, Phường An Hòa, Quận Ninh Kiều',
    district: 'Ninh Kiều'
  },
  {
    id: 'ctump',
    name: 'Đại học Y Dược Cần Thơ',
    shortName: 'ĐH Y Dược CT',
    location: {
      lat: 10.0347429,
      lng: 105.7553636
    },
    address: '179 Nguyễn Văn Cừ, Phường An Khánh, Quận Ninh Kiều',
    district: 'Ninh Kiều'
  },
  {
    id: 'ctut',
    name: 'Trường Đại học Kỹ thuật - Công nghệ Cần Thơ',
    shortName: 'ĐH Kỹ thuật - Công nghệ CT',
    location: {
      lat: 10.046798,
      lng: 105.7679651
    },
    address: '256 Nguyễn Văn Cừ, Phường An Hòa, Quận Ninh Kiều',
    district: 'Ninh Kiều'
  },
  {
    id: 'CYC',
    name: 'Cao đẳng Y tế Cần Thơ',
    shortName: 'CĐ Y tế CT',
    location: {
      lat: 10.0442428,
      lng: 105.764924
    },
    address: '340 Đ. Nguyễn Văn Cừ, An Hoà, Ninh Kiều, Cần Thơ, Vietnam',
    district: 'Ninh Kiều'
  }
]

/**
 * Get universities by district
 */
export function getUniversitiesByDistrict(district: string): University[] {
  return canthoUniversities.filter(uni => 
    uni.district.toLowerCase().includes(district.toLowerCase())
  )
}

/**
 * Get popular universities (major universities in Can Tho)
 */
export function getPopularUniversities(): University[] {
  // Return major universities
  return canthoUniversities.filter(uni => 
    ['ctu', 'fptu-ct', 'ctump', 'nam-can-tho-uni'].includes(uni.id)
  )
}

/**
 * Calculate distance between two coordinates (approximate)
 */
export function calculateDistance(
  lat1: number, lng1: number, 
  lat2: number, lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Find rooms near university (within radius)
 */
export function findUniversitiesNearLocation(
  lat: number, 
  lng: number, 
  radiusKm: number = 5
): University[] {
  return canthoUniversities.filter(uni => {
    const distance = calculateDistance(lat, lng, uni.location.lat, uni.location.lng)
    return distance <= radiusKm
  }).sort((a, b) => {
    const distanceA = calculateDistance(lat, lng, a.location.lat, a.location.lng)
    const distanceB = calculateDistance(lat, lng, b.location.lat, b.location.lng)
    return distanceA - distanceB
  })
}

/**
 * Get search radius suggestions for university areas
 */
export const universitySearchRadii = [
  { label: 'Trong vòng 1km', value: 1 },
  { label: 'Trong vòng 2km', value: 2 },
  { label: 'Trong vòng 3km', value: 3 },
  { label: 'Trong vòng 5km', value: 5 }
]