'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import { getAuthToken, getUserInfo, isTokenExpired } from '@/lib/api/auth'
import { getNotificationsForUser, markNotificationsRead, type NotificationDto } from '@/lib/api/notifications'

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079') + '/hubs/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  // Load history on mount
  useEffect(() => {
    const userInfo = getUserInfo()
    if (!userInfo) return
    const token = getAuthToken()
    if (!token || isTokenExpired(token)) return

    getNotificationsForUser(userInfo.userId).then(data => {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    }).catch(console.error)
  }, [])

  // Set up SignalR connection on mount
  useEffect(() => {
    const token = getAuthToken()
    if (!token || token === 'null' || token === 'undefined') return

    let cleaned = false

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build()

    connection.on('ReceiveNotification', (notification: NotificationDto) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    connection.start()
      .then(() => { if (!cleaned) setConnected(true) })
      .catch(err => {
        // Ignore aborts caused by StrictMode double-mount or Fast Refresh cleanup
        const isAbort = err?.name === 'AbortError' ||
          err?.message?.includes('stopped during negotiation')
        if (!isAbort) console.error(err)
      })

    connectionRef.current = connection

    return () => {
      cleaned = true
      connection.stop()
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const userInfo = getUserInfo()
    if (!userInfo) return

    try {
      await markNotificationsRead(userInfo.userId)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark notifications as read', err)
    }
  }, [])

  const markOneRead = useCallback(async (notificationId: number) => {
    const userInfo = getUserInfo()
    if (!userInfo) return

    try {
      await markNotificationsRead(userInfo.userId, [notificationId])
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }, [])

  return { notifications, unreadCount, connected, markAllRead, markOneRead }
}
