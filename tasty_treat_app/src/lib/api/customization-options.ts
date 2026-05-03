const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

export interface CustomizationOptionDto {
  optionId: number
  name: string
  type: string
  additionalPrice: number
  updatedAt: string
}

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getDesignerOptions(): Promise<CustomizationOptionDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationOptions`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch designer options')
  return res.json()
}

export async function createDesignerOption(data: { name: string; type: string; additionalPrice: number }): Promise<CustomizationOptionDto> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationOptions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create option')
  return res.json()
}

export async function updateDesignerOption(id: number, data: { name?: string; type?: string; additionalPrice?: number }): Promise<CustomizationOptionDto> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationOptions/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update option')
  return res.json()
}

export async function deleteDesignerOption(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationOptions/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to delete option')
}
