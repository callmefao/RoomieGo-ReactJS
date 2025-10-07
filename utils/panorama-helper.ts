/**
 * Panorama Helper Utilities
 * Hỗ trợ kiểm tra và tối ưu hóa ảnh panorama 360°
 */

export interface PanoramaInfo {
  isValid: boolean
  format: string
  estimatedSize?: string
  recommendations: string[]
}

/**
 * Kiểm tra tính hợp lệ của file ảnh panorama
 * @param imageUrl URL của ảnh cần kiểm tra
 * @returns Promise với thông tin về ảnh
 */
export async function checkPanoramaImage(imageUrl: string): Promise<PanoramaInfo> {
  const recommendations: string[] = []
  let isValid = true

  try {
    // 1. Kiểm tra format file
    const format = getImageFormat(imageUrl)
    if (!['jpg', 'jpeg'].includes(format.toLowerCase())) {
      recommendations.push('Nên sử dụng format JPEG/JPG cho ảnh panorama')
    }

    // 2. Kiểm tra khả năng truy cập
    const response = await fetch(imageUrl, { method: 'HEAD' })
    if (!response.ok) {
      isValid = false
      recommendations.push(`Không thể truy cập ảnh (HTTP ${response.status})`)
      return { isValid, format, recommendations }
    }

    // 3. Kiểm tra content-type
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      isValid = false
      recommendations.push('File không phải là ảnh hợp lệ')
    }

    // 4. Kiểm tra kích thước file
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024)
      const estimatedSize = `${sizeInMB.toFixed(1)} MB`
      
      if (sizeInMB > 10) {
        recommendations.push('Ảnh quá lớn (>10MB), có thể load chậm')
      } else if (sizeInMB > 5) {
        recommendations.push('Ảnh khá lớn (>5MB), nên tối ưu để load nhanh hơn')
      }

      return { isValid, format, estimatedSize, recommendations }
    }

    return { isValid, format, recommendations }

  } catch (error) {
    console.error('Error checking panorama image:', error)
    return {
      isValid: false,
      format: getImageFormat(imageUrl),
      recommendations: ['Không thể kiểm tra ảnh - có thể do CORS hoặc network error']
    }
  }
}

/**
 * Lấy format của ảnh từ URL
 */
function getImageFormat(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase() || 'unknown'
  return extension
}

/**
 * Tạo thumbnail URL cho ảnh panorama (nếu có hỗ trợ)
 */
export function generatePanoramaThumbnail(originalUrl: string, width: number = 400): string {
  // Có thể implement logic tạo thumbnail ở đây
  // Hiện tại return original URL
  return originalUrl
}

/**
 * Kiểm tra xem ảnh có phải panorama 360° không (dựa trên tỷ lệ khung hình)
 * @param imageUrl URL ảnh cần kiểm tra
 * @returns Promise<boolean>
 */
export async function isPanoramaRatio(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Panorama 360° thường có tỷ lệ 2:1 (width:height)
      const ratio = img.width / img.height
      const isPanorama = ratio >= 1.8 && ratio <= 2.2 // Cho phép sai số
      resolve(isPanorama)
    }
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}

/**
 * Đề xuất cấu hình tối ưu cho PhotoSphere dựa trên kích thước ảnh
 */
export function getOptimalConfig(imageSize: number) {
  // imageSize in MB
  if (imageSize > 10) {
    return {
      maxTextureSize: 2048,
      quality: 0.8,
      recommendation: 'Ảnh quá lớn, giảm chất lượng texture'
    }
  } else if (imageSize > 5) {
    return {
      maxTextureSize: 4096,
      quality: 0.9,
      recommendation: 'Ảnh lớn, sử dụng texture vừa phải'
    }
  } else {
    return {
      maxTextureSize: 8192,
      quality: 1.0,
      recommendation: 'Ảnh kích thước tối ưu'
    }
  }
}