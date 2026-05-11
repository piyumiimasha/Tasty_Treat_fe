import { ItemDto, CreateItemDto, UpdateItemDto } from "@/lib/api/items"

// Frontend Cake interface
export interface Cake {
  id: number
  name: string
  category: string
  categoryId?: number
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

  // Use imageUrl from backend if available, otherwise check description
  const images = item.imageUrl 
    ? [item.imageUrl] 
    : (additionalData.images || []);

  return {
    id: item.itemId,
    name: item.name,
    category: item.category,
    categoryId: item.categoryId,
    price: item.basePrice,
    size: item.basePriceUnit || additionalData.size || "1 kg",
    flavor: item.flavour || additionalData.flavor || "Custom Flavor",
    rating: additionalData.rating || 0,
    images: images,
    videos: additionalData.videos || [],
  }
}

// Map frontend Cake to backend CreateItemDto (without images, handled separately)
export function mapCakeToCreateItem(cake: Omit<Cake, "id">): CreateItemDto {
  // Store additional fields in description as JSON (excluding images)
  const additionalData = {
    rating: cake.rating,
    videos: cake.videos,
  }

  return {
    name: cake.name,
    categoryId: cake.categoryId,
    flavour: cake.flavor,
    basePrice: cake.price,
    basePriceUnit: cake.size,
    description: JSON.stringify(additionalData),
  }
}

// Map frontend Cake to backend UpdateItemDto (without images, handled separately)
export function mapCakeToUpdateItem(cake: Partial<Cake>): UpdateItemDto {
  const updateDto: UpdateItemDto = {}

  if (cake.name !== undefined) updateDto.name = cake.name
  if (cake.categoryId !== undefined) updateDto.categoryId = cake.categoryId
  if (cake.flavor !== undefined) updateDto.flavour = cake.flavor
  if (cake.price !== undefined) updateDto.basePrice = cake.price
  if (cake.size !== undefined) updateDto.basePriceUnit = cake.size

  // Store additional fields in description as JSON (excluding images)
  const additionalData: any = {}
  if (cake.rating !== undefined) additionalData.rating = cake.rating
  if (cake.videos !== undefined) additionalData.videos = cake.videos

  if (Object.keys(additionalData).length > 0) {
    updateDto.description = JSON.stringify(additionalData)
  }

  return updateDto
}
