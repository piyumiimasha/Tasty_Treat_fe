const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

export interface CustomizationTypeDto {
  typeId: number
  name: string
  isMultiSelect: boolean
}

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getCustomizationTypes(): Promise<CustomizationTypeDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationTypes`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch customization types')
  return res.json()
}

export async function createCustomizationType(data: { name: string }): Promise<CustomizationTypeDto> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationTypes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create type')
  return res.json()
}

export async function updateCustomizationType(id: number, data: { name?: string; isMultiSelect?: boolean }): Promise<CustomizationTypeDto> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationTypes/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update type')
  return res.json()
}

export async function deleteCustomizationType(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/CustomizationTypes/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to delete type')
}
