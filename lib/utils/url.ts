import { convertVietnameseToUrlFriendly } from './vietnamese'

/**
 * Generates a URL slug from rental name and ID
 * @param name - The rental property name
 * @param id - The rental property ID
 * @returns URL slug in format {name-slug}-{id}
 * 
 * @example
 * generateRentalSlug("Phòng trọ Quận Cái Răng", 1)
 * // Returns: "phong-tro-quan-cai-rang-127796416"
 */
export function generateRentalSlug(name: string, id: number): string {
  const propertyName = convertVietnameseToUrlFriendly(name)
  const propertyId = id.toString()
  return `${propertyName}-${propertyId}`
}

/**
 * Parses a rental slug to extract the property ID
 * @param slug - The URL slug to parse
 * @returns The property ID if found, null otherwise
 * 
 * @example
 * parseSlugToId("phong-tro-quan-cai-rang-127796416")
 * // Returns: "127796416"
 */
export function parseSlugToId(slug: string): string | null {
  const lastDashIndex = slug.lastIndexOf("-")
  if (lastDashIndex === -1) return null
  
  const potentialId = slug.substring(lastDashIndex + 1)
  
  // Check if the last part is a number
  if (/^\d+$/.test(potentialId)) {
    return potentialId
  }
  
  return null
}

/**
 * Parses a rental slug to extract the property name part (before ID)
 * @param slug - The URL slug to parse
 * @returns The property name part of the slug
 * 
 * @example
 * parseSlugToName("phong-tro-quan-cai-rang-127796416")
 * // Returns: "phong-tro-quan-cai-rang"
 */
export function parseSlugToName(slug: string): string {
  const lastDashIndex = slug.lastIndexOf("-")
  if (lastDashIndex === -1) return slug
  
  const potentialId = slug.substring(lastDashIndex + 1)
  
  // If the last part is a number, return everything before it
  if (/^\d+$/.test(potentialId)) {
    return slug.substring(0, lastDashIndex)
  }
  
  // If not, return the entire slug
  return slug
}

/**
 * Validates if a slug matches the expected format for a given rental
 * @param slug - The URL slug to validate
 * @param expectedName - The expected rental name
 * @param expectedId - The expected rental ID
 * @returns True if the slug matches the expected format
 */
export function validateRentalSlug(slug: string, expectedName: string, expectedId: string): boolean {
  const expectedSlug = generateRentalSlug(expectedName, parseInt(expectedId))
  return slug === expectedSlug
}