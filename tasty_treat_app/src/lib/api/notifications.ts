import { getAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

export interface NotificationDto {
  notificationId: number
  userId: number
  type: 'OrderStatus' | 'AdminAlert' | 'DeliveryUpdate' | string
  message: string
  referenceId: number | null
  isRead: boolean
  createdAt: string
}

function buildHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? getAuthToken() : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getNotificationsForUser(userId: number, take = 50): Promise<NotificationDto[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/Notifications/user/${userId}?take=${take}`,
    { headers: buildHeaders() }
  )
  if (!response.ok) throw new Error('Failed to fetch notifications')
  return response.json()
}

export async function getUnreadCount(userId: number): Promise<number> {
  const response = await fetch(
    `${API_BASE_URL}/api/Notifications/user/${userId}/unread-count`,
    { headers: buildHeaders() }
  )
  if (!response.ok) throw new Error('Failed to fetch unread count')
  return response.json()
}

export async function markNotificationsRead(userId: number, notificationIds?: number[]): Promise<void> {
  await fetch(
    `${API_BASE_URL}/api/Notifications/user/${userId}/mark-read`,
    {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify({ notificationIds: notificationIds ?? null }),
    }
  )
}
