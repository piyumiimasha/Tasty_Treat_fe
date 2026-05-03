import type { CakeDesign, OptionCategory } from "@/lib/customizer-options"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function parseId(id: string): number | undefined {
  const n = parseInt(id, 10)
  return isNaN(n) ? undefined : n
}

export async function generateCakePreview(
  design: CakeDesign,
  categories: OptionCategory[]
): Promise<string> {
  const cat = (key: string) => categories.find((c) => c.key === key)

  const payload = {
    layersOptionId:      parseId(design.layers)   ?? null,
    shapeOptionId:       parseId(design.shape)    ?? null,
    frostingOptionId:    parseId(design.frosting)  ?? null,
    flavourOptionId:     parseId(design.flavour)   ?? null,
    topperOptionId:      parseId(design.topper)    ?? null,
    colorOptionId:       design.color ? (parseId(design.color) ?? null) : null,
    decorationOptionIds: design.decorations.map((d) => parseId(d)).filter((n): n is number => n !== undefined),
    dietaryOptionIds:    design.dietary.map((d) => parseId(d)).filter((n): n is number => n !== undefined),
    instructions:        design.instructions || null,
  }

  const res = await fetch(`${API_BASE_URL}/api/CakePreview/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Image generation failed')
  }

  const data = await res.json()
  if (!data.imageUrl) throw new Error('No image URL returned')
  return data.imageUrl as string
}
