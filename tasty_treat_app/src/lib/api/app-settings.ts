const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getBasePrice(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/AppSettings/base_price`, { headers: headers() })
    if (!res.ok) return 2000
    const text = await res.text()
    const parsed = parseFloat(text.replace(/"/g, ''))
    return isNaN(parsed) ? 2000 : parsed
  } catch {
    return 2000
  }
}

export async function updateBasePrice(price: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/AppSettings/base_price`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(price.toString()),
  })
  if (!res.ok) throw new Error('Failed to update base price')
}
