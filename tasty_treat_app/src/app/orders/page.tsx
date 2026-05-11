"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Check, Palette, ChefHat, MessageCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { getUserInfo } from "@/lib/api/auth"
import { CartItem } from "@/lib/api/cart"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

interface OrderDto {
  orderId: number
  customerId: number
  status: string
  totalAmount: number
  orderDate: string
  deliveryAddress: string | null
}

interface QuoteDto {
  quoteId: number
  convertedOrderId: number | null
  items: string
}

// Status pipeline â€” order matters
const STATUS_PIPELINE = ["Pending", "In Progress", "Baking", "Decoration", "Ready for Pickup", "Completed"]

const STAGES: { name: string; icon: React.ReactNode }[] = [
  { name: "Order Confirmed",   icon: <Check className="w-5 h-5" /> },
  { name: "Baking",            icon: <ChefHat className="w-5 h-5" /> },
  { name: "Decoration",        icon: <Palette className="w-5 h-5" /> },
  { name: "Ready for Pickup",  icon: <Package className="w-5 h-5" /> },
  { name: "Completed",         icon: <Check className="w-5 h-5" /> },
]

function stageStatus(stageIndex: number, statusIndex: number): "completed" | "in-progress" | "pending" {
  if (stageIndex === 0) return "completed"   // Order Confirmed is always done
  // Offset by 1 because "In Progress" is removed from visible stages but kept in the pipeline
  const pipelineIndex = stageIndex + 1
  if (pipelineIndex < statusIndex) return "completed"
  if (pipelineIndex === statusIndex) return "in-progress"
  return "pending"
}

function StatusBadge({ s }: { s: "completed" | "in-progress" | "pending" }) {
  if (s === "completed")  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>
  if (s === "in-progress") return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>
  return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [quoteItems, setQuoteItems] = useState<Record<number, CartItem[]>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    const info = getUserInfo()
    if (!info) { setLoading(false); return }
    try {
      const [ordersRes, quotesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Orders/customer/${info.userId}`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/InstantQuotes/customer/${info.userId}`, { headers: authHeaders() }),
      ])
      if (!ordersRes.ok) throw new Error()
      const data: OrderDto[] = await ordersRes.json()
      const sorted = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      setOrders(sorted)
      if (sorted.length > 0) setExpandedId(sorted[0].orderId)

      if (quotesRes.ok) {
        const quotes: QuoteDto[] = await quotesRes.json()
        const map: Record<number, CartItem[]> = {}
        quotes.forEach((q) => {
          if (q.convertedOrderId != null) {
            try { map[q.convertedOrderId] = JSON.parse(q.items || "[]") } catch {}
          }
        })
        setQuoteItems(map)
      }
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleExpand = (orderId: number) => {
    setExpandedId((prev) => prev === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Follow your cake from preparation through delivery</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center border border-border">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">Start by browsing our cakes and placing an order.</p>
            <Link href="/"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Cakes</Button></Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusIndex = STATUS_PIPELINE.indexOf(order.status)
              const items = quoteItems[order.orderId] ?? []
              const first = items[0]
              const title = first
                ? items.length > 1 ? `${first.name} + ${items.length - 1} more` : first.name
                : `Order #ORD-${order.orderId}`
              const image = first?.image

              return (
                <Card key={order.orderId} className="border border-border overflow-hidden">
                  <button
                    onClick={() => handleExpand(order.orderId)}
                    className="w-full p-6 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {image
                            ? <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground" /></div>
                          }
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                          <p className="text-sm text-muted-foreground">Order ID: #ORD-{order.orderId}</p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                            {order.deliveryAddress && <span className="truncate max-w-xs">To: {order.deliveryAddress}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-semibold text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {expandedId === order.orderId ? "Click to collapse" : "Click to expand"}
                        </p>
                      </div>
                    </div>
                  </button>

                  {expandedId === order.orderId && (
                    <div className="border-t border-border p-6 bg-background/50">
                      {/* Items list */}
                      {items.length > 0 && (
                        <div className="mb-6 space-y-2">
                          {items.map((item) => (
                            <div key={item.cartItemId} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">{item.name} Ã— {item.quantity}</span>
                              <span className="text-muted-foreground">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="space-y-4">
                        {STAGES.map((stage, idx) => {
                          const s = stageStatus(idx, statusIndex === -1 ? 0 : statusIndex)
                          return (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  s === "completed"  ? "bg-emerald-100 text-emerald-700" :
                                  s === "in-progress"? "bg-blue-100 text-blue-700" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {stage.icon}
                                </div>
                                {idx < STAGES.length - 1 && (
                                  <div className={`w-0.5 h-12 mt-2 ${s === "completed" ? "bg-emerald-200" : "bg-muted"}`} />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-foreground">{stage.name}</h4>
                                  <StatusBadge s={s} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                        <Link href="/support" className="flex-1">
                          <Button variant="outline" className="w-full border border-border bg-transparent">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact Baker
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

