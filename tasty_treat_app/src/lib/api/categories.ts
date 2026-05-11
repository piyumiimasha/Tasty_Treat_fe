const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export interface CategoryDto {
  categoryId: number
  name: string
}

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/Categories`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(name: string): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/Categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function updateCategory(id: number, name: string): Promise<CategoryDto> {
  const res = await fetch(`${API_BASE_URL}/api/Categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/Categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete category')
}
