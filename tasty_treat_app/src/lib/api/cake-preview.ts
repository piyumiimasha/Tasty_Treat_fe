import type { CakeDesign, OptionCategory } from "@/lib/customizer-options"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
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
  const selectedOptionIds = categories.flatMap((cat) => {
    const val = design[cat.key]
    if (Array.isArray(val))
      return val.map(parseId).filter((n): n is number => n !== undefined)
    if (typeof val === 'string' && val) {
      const id = parseId(val)
      return id !== undefined ? [id] : []
    }
    return []
  })

  const payload = {
    selectedOptionIds,
    instructions: (design.instructions as string) || null,
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
