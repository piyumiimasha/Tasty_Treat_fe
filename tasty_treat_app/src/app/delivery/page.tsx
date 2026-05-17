"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Truck, PackageCheck, MapPin, Calendar, DollarSign, RefreshCw, MessageSquare, Headphones, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getOrdersByStatus, updateOrder, type OrderDto } from "@/lib/api/orders"
import { getUserInfo } from "@/lib/api/auth"
import { getDirectConversation, getConversation, sendMessage, type ChatMsgDto } from "@/lib/api/chat"

// ─── helpers ────────────────────────────────────────────────────────────────

function asUtc(iso: string) {
  return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z"
}
function formatTime(iso: string) {
  return new Date(asUtc(iso)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Chat drawer ─────────────────────────────────────────────────────────────

type ChatMode = { kind: "customer"; customerId: number; customerName: string; orderId: number } |
                { kind: "admin"; orderId: number }

function ChatDrawer({
  mode,
  deliveryPersonId,
  onClose,
}: {
  mode: ChatMode
  deliveryPersonId: number
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMsgDto[]>([])
  const [input, setInput] = useState(
    mode.kind === "admin" ? `[Order #ORD-${mode.orderId}] ` : ""
  )
  const [sending, setSending] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  const loadMessages = useCallback(async () => {
    try {
      if (mode.kind === "customer") {
        const data = await getDirectConversation(deliveryPersonId, mode.customerId)
        setMessages(data)
      } else {
        // admin mode: fetch delivery person's admin conversation and filter
        const data = await getConversation(deliveryPersonId)
        setMessages(data.filter(m =>
          (m.senderId === deliveryPersonId && m.recipientId == null) ||
          m.recipientId === deliveryPersonId
        ))
      }
    } catch {}
  }, [mode, deliveryPersonId])

  useEffect(() => {
    loadMessages()
    const id = setInterval(loadMessages, 3000)
    return () => clearInterval(id)
  }, [loadMessages])

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const onScroll = () => {
      shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const el = messagesRef.current
    if (el && shouldAutoScroll.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      setSending(true)
      shouldAutoScroll.current = true
      const recipientId = mode.kind === "customer" ? mode.customerId : undefined
      const msg = await sendMessage(deliveryPersonId, input.trim(), recipientId)
      setMessages(prev => [...prev, msg])
      setInput(mode.kind === "admin" ? `[Order #ORD-${mode.orderId}] ` : "")
    } catch {} finally {
      setSending(false)
    }
  }

  const title = mode.kind === "customer"
    ? `Customer: ${mode.customerName}`
    : `Admin — Order #ORD-${mode.orderId}`
  const subtitle = mode.kind === "customer"
    ? `Re: Order #ORD-${mode.orderId}`
    : "Support & escalations"
  const avatarLabel = mode.kind === "customer" ? initials(mode.customerName) : "AD"

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-muted/30 flex-shrink-0">
          <Avatar className="w-9 h-9">
            <AvatarFallback className={`text-sm font-semibold ${mode.kind === "customer" ? "bg-sky-100 text-sky-700" : "bg-primary text-primary-foreground"}`}>
              {avatarLabel}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === deliveryPersonId
            return (
              <div key={msg.msgId} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <Avatar className="w-6 h-6 flex-shrink-0 mt-1">
                    <AvatarFallback className="text-xs bg-muted">
                      {initials(msg.senderName || "?")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}>
                    {msg.msgTxt}
                  </div>
                  <span className="text-xs text-muted-foreground px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <Input
              placeholder={mode.kind === "customer" ? `Message ${mode.customerName}…` : "Message admin…"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              className="flex-1 text-sm"
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Delivery page ────────────────────────────────────────────────────────────

export default function DeliveryPage() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<number | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode | null>(null)
  const [deliveryPersonId, setDeliveryPersonId] = useState<number | null>(null)

  // customer names fetched alongside orders
  const [customerNames, setCustomerNames] = useState<Record<number, string>>({})

  const { toast } = useToast()

  useEffect(() => {
    const info = getUserInfo()
    if (info) setDeliveryPersonId(info.userId)
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getOrdersByStatus("Ready for Delivery")
      setOrders(data.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()))
    } catch {
      toast({ title: "Error", description: "Failed to load deliveries.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Fetch customer names for the loaded orders
  useEffect(() => {
    if (orders.length === 0) return
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:55079"
    fetch(`${API_BASE_URL}/api/Users`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then(r => r.ok ? r.json() : [])
      .then((users: { userId: number; name: string }[]) => {
        setCustomerNames(Object.fromEntries(users.map(u => [u.userId, u.name])))
      })
      .catch(() => {})
  }, [orders])

  const markDelivered = async (orderId: number) => {
    try {
      setCompleting(orderId)
      await updateOrder(orderId, { status: "Delivery Completed" })
      setOrders(prev => prev.filter(o => o.orderId !== orderId))
      toast({ title: "Delivered!", description: `Order #ORD-${orderId} marked as delivered.` })
    } catch {
      toast({ title: "Error", description: "Failed to update order.", variant: "destructive" })
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Deliveries</h1>
            <p className="text-sm text-muted-foreground">Orders ready for delivery</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading} className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageCheck className="w-14 h-14 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No orders are ready for delivery right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const customerName = customerNames[order.customerId] ?? `Customer #${order.customerId}`
            return (
              <Card key={order.orderId} className="border border-border/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-foreground text-base">#ORD-{order.orderId}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                          Ready for Delivery
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="leading-snug">{order.deliveryAddress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(order.orderDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold text-foreground">Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                        {order.specialInstructions && (
                          <p className="mt-1 italic text-xs bg-muted rounded-md px-2.5 py-1.5 leading-snug">
                            Note: {order.specialInstructions}
                          </p>
                        )}
                      </div>

                      {/* Chat buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => deliveryPersonId && setChatMode({
                            kind: "customer",
                            customerId: order.customerId,
                            customerName,
                            orderId: order.orderId,
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message Customer
                        </button>
                        <button
                          onClick={() => deliveryPersonId && setChatMode({
                            kind: "admin",
                            orderId: order.orderId,
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          Contact Admin
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={() => markDelivered(order.orderId)}
                      disabled={completing === order.orderId}
                      className="flex-shrink-0 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                    >
                      <PackageCheck className="w-4 h-4" />
                      {completing === order.orderId ? "Updating…" : "Mark Delivered"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Chat drawer */}
      {chatMode && deliveryPersonId && (
        <ChatDrawer
          mode={chatMode}
          deliveryPersonId={deliveryPersonId}
          onClose={() => setChatMode(null)}
        />
      )}
    </div>
  )
}
