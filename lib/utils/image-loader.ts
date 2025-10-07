/**
 * Utility to generate image paths for rental properties
 * Automatically creates paths for all images in each category folder
 */

export interface RentalImages {
  parking: string[]
  roomPhotos: string[]
  entrance: string[]
}

/**
 * Generates image paths for a rental property
 * @param rentalId - The ID of the rental property
 * @returns Object with arrays of image paths for each category
 */
export function generateRentalImages(rentalId: string | number): RentalImages {
  const id = rentalId.toString()
  
  // Define how many images each category should have (you can adjust these)
  const imageConfig = {
    parking: 2,     // 2 parking images
    roomPhotos: 10, // Max 10 room photos (will auto-detect available)
    entrance: 1,    // 1 entrance image
  }
  
  return {
    parking: Array.from({ length: imageConfig.parking }, (_, i) => 
      `/rental-images/${id}/parking/parking-${i + 1}.jpg`
    ),
    roomPhotos: Array.from({ length: imageConfig.roomPhotos }, (_, i) => 
      `/rental-images/${id}/rooms/room-${i + 1}.jpg`
    ),
    entrance: Array.from({ length: imageConfig.entrance }, (_, i) => 
      `/rental-images/${id}/entrance/entrance-${i + 1}.jpg`
    ),
  }
}

/**
 * Get all images for a specific category
 * @param rentalId - The ID of the rental property
 * @param category - The image category
 * @param maxImages - Maximum number of images to generate (default: 10)
 * @returns Array of image paths for the category
 */
export function getCategoryImages(
  rentalId: string | number, 
  category: keyof RentalImages, 
  maxImages: number = 10
): string[] {
  const id = rentalId.toString()
  
  const folderMap: Record<keyof RentalImages, string> = {
    roomPhotos: 'rooms',
    parking: 'parking', 
    entrance: 'entrance'
  }
  
  const nameMap: Record<keyof RentalImages, string> = {
    roomPhotos: 'room',
    parking: 'parking',
    entrance: 'entrance'
  }
  
  return Array.from({ length: maxImages }, (_, i) => 
    `/rental-images/${id}/${folderMap[category]}/${nameMap[category]}-${i + 1}.jpg`
  )
}