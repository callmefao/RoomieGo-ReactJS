/**
 * Google Cloud Storage Service for Frontend
 * ========================================
 * 
 * Service để handle Google Cloud Storage operations trong Next.js
 * Chủ yếu để validate images và generate signed URLs
 */

import { Storage } from '@google-cloud/storage'
import path from 'path'

// Initialize Google Cloud Storage
let storage: Storage | null = null

const initStorage = () => {
  if (!storage) {
    try {
      storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID || 'tro4s-473211',
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './keys/tro4s-storage-key.json',
      })
    } catch (error) {
      console.error('Failed to initialize Google Cloud Storage:', error)
    }
  }
  return storage
}

export class GCSService {
  private static bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || 'tro4s-room-images'
  
  /**
   * Check if an image URL exists and is accessible
   */
  public static async checkImageExists(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.error('Error checking image:', error)
      return false
    }
  }

  /**
   * Get signed URL for private images (nếu cần)
   */
  public static async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const gcs = initStorage()
      if (!gcs) return null

      const bucket = gcs.bucket(this.bucketName)
      const file = bucket.file(fileName)

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000, // expires in seconds
      })

      return signedUrl
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return null
    }
  }

  /**
   * Extract file path from GCS URL
   */
  public static extractFilePathFromUrl(gcsUrl: string): string | null {
    try {
      const bucketUrl = `https://storage.googleapis.com/${this.bucketName}/`
      if (gcsUrl.startsWith(bucketUrl)) {
        return gcsUrl.replace(bucketUrl, '')
      }
      return null
    } catch (error) {
      console.error('Error extracting file path:', error)
      return null
    }
  }

  /**
   * Build full GCS URL from file path
   */
  public static buildGCSUrl(filePath: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_GCS_BUCKET_URL || `https://storage.googleapis.com/${this.bucketName}`
    return `${baseUrl}/${filePath}`
  }

  /**
   * Validate image URL format
   */
  public static isValidGCSUrl(url: string): boolean {
    if (!url) return false
    
    const bucketUrl = `https://storage.googleapis.com/${this.bucketName}/`
    return url.startsWith(bucketUrl) || url.startsWith('https://storage.googleapis.com/')
  }

  /**
   * Get image with fallback
   */
  public static async getImageWithFallback(
    optimizedUrl: string, 
    originalUrl: string, 
    fallbackUrl: string = '/placeholder.jpg'
  ): Promise<string> {
    try {
      // First try optimized URL
      if (await this.checkImageExists(optimizedUrl)) {
        return optimizedUrl
      }
      
      // Then try original URL
      if (await this.checkImageExists(originalUrl)) {
        return originalUrl
      }
      
      // Finally use fallback
      return fallbackUrl
    } catch (error) {
      console.error('Error getting image with fallback:', error)
      return fallbackUrl
    }
  }

  /**
   * Preload images for better UX
   */
  public static preloadImages(imageUrls: string[]): Promise<boolean[]> {
    const promises = imageUrls.map(url => this.preloadSingleImage(url))
    return Promise.allSettled(promises).then(results => 
      results.map(result => result.status === 'fulfilled' && result.value)
    )
  }

  private static preloadSingleImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }
}

export default GCSService