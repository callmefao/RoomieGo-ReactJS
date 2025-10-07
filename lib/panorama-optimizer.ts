// Image optimization utilities
export class PanoramaImageOptimizer {
  private static cache = new Map<string, string>()
  
  /**
   * Tạo multiple sizes cho panorama image
   */
  static generateResponsiveUrls(baseUrl: string) {
    const ext = baseUrl.split('.').pop()
    const base = baseUrl.replace(`.${ext}`, '')
    
    return {
      thumbnail: `${base}_thumb.${ext}`,     // 512x256 - Preview nhanh
      medium: `${base}_medium.${ext}`,       // 2048x1024 - Mobile
      high: `${base}_high.${ext}`,           // 4096x2048 - Desktop  
      original: baseUrl                      // Original - Full quality
    }
  }

  /**
   * Progressive loading: Load từ chất lượng thấp đến cao
   */
  static async loadProgressive(urls: ReturnType<typeof PanoramaImageOptimizer.generateResponsiveUrls>) {
    const loadImage = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = reject
        img.src = url
      })
    }

    try {
      // 1. Load thumbnail đầu tiên (nhanh nhất)
      const thumbnail = await loadImage(urls.thumbnail)
      
      // 2. Detect device capability
      const isMobile = window.innerWidth < 768
      const hasSlowConnection = (navigator as any)?.connection?.effectiveType === '2g' || 
                               (navigator as any)?.connection?.effectiveType === 'slow-2g'
      
      // 3. Load appropriate quality
      if (hasSlowConnection) {
        return { url: urls.medium, quality: 'medium' }
      } else if (isMobile) {
        const medium = await loadImage(urls.medium)
        return { url: medium, quality: 'medium' }
      } else {
        // Desktop: Load high quality
        const high = await loadImage(urls.high)
        return { url: high, quality: 'high' }
      }
    } catch (error) {
      console.warn('Progressive loading failed, using original:', error)
      return { url: urls.original, quality: 'original' }
    }
  }

  /**
   * Cache management
   */
  static setCached(url: string, blob: string) {
    // Limit cache size (max 10 images)
    if (this.cache.size > 10) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(url, blob)
  }

  static getCached(url: string): string | null {
    return this.cache.get(url) || null
  }

  /**
   * Preload next images in background
   */
  static preloadNext(urls: string[]) {
    const preload = (url: string) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
    }

    // Preload next 2-3 images
    urls.slice(0, 3).forEach(preload)
  }
}

/**
 * Connection speed detector
 */
export class ConnectionDetector {
  static getConnectionSpeed(): 'fast' | 'medium' | 'slow' {
    const connection = (navigator as any)?.connection
    
    if (!connection) return 'medium'
    
    const effectiveType = connection.effectiveType
    const downlink = connection.downlink // Mbps
    
    if (effectiveType === '4g' && downlink > 10) return 'fast'
    if (effectiveType === '3g' || (effectiveType === '4g' && downlink < 5)) return 'medium'
    return 'slow'
  }

  static shouldUseProgressiveLoading(): boolean {
    const speed = this.getConnectionSpeed()
    return speed !== 'fast'
  }
}