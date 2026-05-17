'use client'

import { Bell, Package, Truck, ShieldAlert, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationDto } from '@/lib/api/notifications'

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative rounded-full p-2 hover:bg-muted">
          <Bell className="w-4 h-4 text-foreground/70" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl border-border/60 p-1">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-accent hover:underline font-normal"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((n) => (
                <NotificationItem key={n.notificationId} notification={n} onRead={markOneRead} />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({
  notification: n,
  onRead,
}: {
  notification: NotificationDto
  onRead: (id: number) => void
}) {
  return (
    <div
      onClick={() => { if (!n.isRead) onRead(n.notificationId) }}
      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg mx-1 transition-colors ${
        !n.isRead
          ? 'bg-accent/5 hover:bg-accent/10 cursor-pointer'
          : 'cursor-default'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        <NotificationIcon type={n.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{n.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(n.createdAt.endsWith('Z') ? n.createdAt : n.createdAt + 'Z'), { addSuffix: true })}
        </p>
      </div>
      {!n.isRead && (
        <span className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
      )}
    </div>
  )
}

function NotificationIcon({ type }: { type: string }) {
  const base = 'w-4 h-4'
  if (type === 'OrderStatus') return <Package className={`${base} text-blue-500`} />
  if (type === 'AdminAlert') return <ShieldAlert className={`${base} text-amber-500`} />
  if (type === 'DeliveryUpdate') return <Truck className={`${base} text-green-500`} />
  if (type === 'SupportMessage') return <MessageCircle className={`${base} text-purple-500`} />
  return <Bell className={`${base} text-muted-foreground`} />
}
