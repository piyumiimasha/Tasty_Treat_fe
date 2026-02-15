import { ItemDto, CreateItemDto, UpdateItemDto } from "@/lib/api/items"

// Frontend Cake interface
export interface Cake {
  id: number
  name: string
  category: string
  price: number
  size: string
  flavor: string
  rating: number
  images: string[]
  videos: string[]
}

// Map backend ItemDto to frontend Cake interface
export function mapItemToCake(item: ItemDto): Cake {
  // Try to parse description as JSON for additional fields
  let additionalData: any = {}
  try {
    if (item.description) {
      additionalData = JSON.parse(item.description)
    }
  } catch {
    // If description is not JSON, ignore
  }

  return {
    id: item.itemId,
    name: item.name,
    category: item.category,
    price: item.basePrice,
    size: item.basePriceUnit || additionalData.size || "1 kg",
    flavor: additionalData.flavor || "Custom Flavor",
    rating: additionalData.rating || 4.5,
    images: additionalData.images || [],
    videos: additionalData.videos || [],
  }
}

// Map frontend Cake to backend CreateItemDto
export function mapCakeToCreateItem(cake: Omit<Cake, "id">): CreateItemDto {
  // Store additional fields in description as JSON
  const additionalData = {
    size: cake.size,
    flavor: cake.flavor,
    rating: cake.rating,
    images: cake.images,
    videos: cake.videos,
  }

  return {
    name: cake.name,
    category: cake.category,
    basePrice: cake.price,
    basePriceUnit: cake.size,
    description: JSON.stringify(additionalData),
  }
}

// Map frontend Cake to backend UpdateItemDto
export function mapCakeToUpdateItem(cake: Partial<Cake>): UpdateItemDto {
  const updateDto: UpdateItemDto = {}

  if (cake.name !== undefined) updateDto.name = cake.name
  if (cake.category !== undefined) updateDto.category = cake.category
  if (cake.price !== undefined) updateDto.basePrice = cake.price
  if (cake.size !== undefined) updateDto.basePriceUnit = cake.size

  // Store additional fields in description as JSON
  const additionalData: any = {}
  if (cake.size !== undefined) additionalData.size = cake.size
  if (cake.flavor !== undefined) additionalData.flavor = cake.flavor
  if (cake.rating !== undefined) additionalData.rating = cake.rating
  if (cake.images !== undefined) additionalData.images = cake.images
  if (cake.videos !== undefined) additionalData.videos = cake.videos

  if (Object.keys(additionalData).length > 0) {
    updateDto.description = JSON.stringify(additionalData)
  }

  return updateDto
}
