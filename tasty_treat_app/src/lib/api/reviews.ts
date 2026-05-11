const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export interface ReviewDto {
  reviewId: number
  orderId: number
  itemId: number
  customerId: number
  comment?: string
  rating: number
  reviewDate: string
}

export interface CreateReviewDto {
  orderId: number
  itemId: number
  customerId: number
  comment?: string
  rating: number
}

export async function createReview(dto: CreateReviewDto): Promise<ReviewDto> {
  const res = await fetch(`${API_BASE_URL}/api/Reviews`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Failed to submit review')
  return res.json()
}

export async function getCustomerReviews(customerId: number): Promise<ReviewDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/Reviews/customer/${customerId}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

export async function getItemReviews(itemId: number): Promise<ReviewDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/Reviews/item/${itemId}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch item reviews')
  return res.json()
}

export async function updateReview(reviewId: number, dto: { comment?: string; rating?: number }): Promise<ReviewDto> {
  const res = await fetch(`${API_BASE_URL}/api/Reviews/${reviewId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Failed to update review')
  return res.json()
}

export async function deleteReview(reviewId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/Reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete review')
}
