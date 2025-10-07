/**
 * Quick Image URL Test
 * ===================
 * 
 * Test script để kiểm tra image URLs từ Django API
 */

// Test image URLs from Django API response
const testImageUrls = {
  original: "https://storage.googleapis.com/tro4s-room-images/original/rooms/36/exterior/7768f032-2264-450f-b496-6d550ead43c1.jpg",
  optimized: "https://storage.googleapis.com/tro4s-room-images/optimized/rooms/36/exterior/b11b2843-5762-410a-afde-b7e6a9349dd5.jpg"
}

// Mock room data structure như Django trả về
const mockRoomData = {
  id: 36,
  title: "Phòng trọ trung tâm",
  price: 2500000,
  area: 20,
  location: "Quận 1, TP.HCM",
  status: 1,
  owner: {
    id: 5,
    username: "owner1"
  },
  images: [
    {
      original_url: "https://storage.googleapis.com/tro4s-room-images/original/rooms/36/main/abc.jpg",
      optimized_url: "https://storage.googleapis.com/tro4s-room-images/optimized/rooms/36/main/xyz.jpg",
      image_type: "main",
      order: 1,
      image_format: "JPEG"
    },
    {
      original_url: "https://storage.googleapis.com/tro4s-room-images/original/rooms/36/exterior/7768f032-2264-450f-b496-6d550ead43c1.jpg",
      optimized_url: "https://storage.googleapis.com/tro4s-room-images/optimized/rooms/36/exterior/b11b2843-5762-410a-afde-b7e6a9349dd5.jpg",
      image_type: "exterior",
      order: 8,
      image_format: "JPEG"
    }
  ]
}

export { testImageUrls, mockRoomData }