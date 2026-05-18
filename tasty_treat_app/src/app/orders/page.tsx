"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Package, Check, Palette, ChefHat, MessageCircle,
  ShoppingBag, Star, ClipboardList, ChevronDown, ChevronUp, Truck,
} from "lucide-react"
import Link from "next/link"
import { getUserInfo } from "@/lib/api/auth"
import { CartItem } from "@/lib/api/cart"
import { createReview, getCustomerReviews } from "@/lib/api/reviews"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:55079"

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
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

const PICKUP_PIPELINE   = ["Pending", "In Progress", "Baking", "Decoration", "Ready for Pickup", "Completed"]
const DELIVERY_PIPELINE = ["Pending", "In Progress", "Baking", "Decoration", "Ready for Delivery", "Out for Delivery", "Completed"]

const PICKUP_STAGES: { name: string; icon: React.ReactNode }[] = [
  { name: "Confirmed",  icon: <Check className="w-4 h-4" /> },
  { name: "Baking",     icon: <ChefHat className="w-4 h-4" /> },
  { name: "Decoration", icon: <Palette className="w-4 h-4" /> },
  { name: "Ready",      icon: <Package className="w-4 h-4" /> },
  { name: "Completed",  icon: <Check className="w-4 h-4" /> },
]

const DELIVERY_STAGES: { name: string; icon: React.ReactNode }[] = [
  { name: "Confirmed",  icon: <Check className="w-4 h-4" /> },
  { name: "Baking",     icon: <ChefHat className="w-4 h-4" /> },
  { name: "Decoration", icon: <Palette className="w-4 h-4" /> },
  { name: "Ready",      icon: <Package className="w-4 h-4" /> },
  { name: "On the Way", icon: <Truck className="w-4 h-4" /> },
  { name: "Completed",  icon: <Check className="w-4 h-4" /> },
]

function stageStatus(stageIndex: number, statusIndex: number, pipelineLength: number): "completed" | "active" | "pending" {
  if (stageIndex === 0) return "completed"
  if (statusIndex === pipelineLength - 1) return "completed"
  const pipelineIndex = stageIndex + 1
  if (pipelineIndex < statusIndex) return "completed"
  if (pipelineIndex === statusIndex) return "active"
  return "pending"
}

// ─── Horizontal stepper ───────────────────────────────────────────────────────

function OrderStepper({ status, isDelivery }: { status: string; isDelivery: boolean }) {
  const pipeline = isDelivery ? DELIVERY_PIPELINE : PICKUP_PIPELINE
  const stages   = isDelivery ? DELIVERY_STAGES   : PICKUP_STAGES
  const rawIdx   = pipeline.indexOf(status)
  const idx      = rawIdx === -1 ? 0 : rawIdx
  return (
    <div className="w-full px-2 py-6">
      <div className="relative flex items-start justify-between">

        {/* Connecting track behind everything */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-[2.5%]" />

        {stages.map((stage, i) => {
          const s = stageStatus(i, idx, pipeline.length)
          const isCompleted = s === "completed"
          const isActive    = s === "active"

          return (
            <div key={i} className="relative flex flex-col items-center flex-1 z-10">

              {/* Filled track segment up to this node */}
              {i > 0 && (
                <div
                  className="absolute top-5 right-1/2 h-0.5 w-full -translate-y-px transition-all duration-500"
                  style={{
                    background: isCompleted || isActive
                      ? "linear-gradient(to right, #10B981, #10B981)"
                      : "transparent",
                  }}
                />
              )}

              {/* Step circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : isActive
                    ? "text-white shadow-md"
                    : "bg-muted text-muted-foreground border-2 border-border"
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, #A0526E, #C97B96)",
                  boxShadow: "0 0 0 4px rgba(201,123,150,0.18)",
                } : {}}
              >
                {isActive ? (
                  <span className="relative flex">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-30" />
                    {stage.icon}
                  </span>
                ) : stage.icon}
              </div>

              {/* Label */}
              <p className={`mt-2.5 text-[11px] font-semibold text-center leading-tight ${
                isCompleted ? "text-emerald-600"
                : isActive   ? "text-primary"
                : "text-muted-foreground"
              }`}>
                {stage.name}
              </p>
              {isActive && (
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #A0526E, #C97B96)" }}>
                  Now
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}>
          <Star className={`w-8 h-8 transition-colors ${
            star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
          }`} />
        </button>
      ))}
    </div>
  )
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    "Pending":          { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
    "In Progress":      { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
    "Baking":           { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
    "Decoration":       { bg: "#F3E8FF", text: "#6B21A8", dot: "#A855F7" },
    "Ready for Pickup":   { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
    "Ready for Delivery": { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
    "Out for Delivery":   { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
    "Completed":          { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  }
  const c = map[status] ?? { bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF" }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ReviewDialogState { orderId: number; customerId: number; items: CartItem[] }

export default function OrdersPage() {
  const [orders, setOrders]                 = useState<OrderDto[]>([])
  const [quoteItems, setQuoteItems]         = useState<Record<number, CartItem[]>>({})
  const [expandedId, setExpandedId]         = useState<number | null>(null)
  const [loading, setLoading]               = useState(true)
  const [reviewedIds, setReviewedIds]       = useState<Set<number>>(new Set())
  const [reviewDialog, setReviewDialog]     = useState<ReviewDialogState | null>(null)
  const [reviewRating, setReviewRating]     = useState(0)
  const [reviewComment, setReviewComment]   = useState("")
  const [submittingReview, setSubmitting]   = useState(false)

  const loadOrders = useCallback(async () => {
    const info = getUserInfo()
    if (!info) { setLoading(false); return }
    try {
      const [ordersRes, quotesRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Orders/customer/${info.userId}`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/InstantQuotes/customer/${info.userId}`, { headers: authHeaders() }),
        getCustomerReviews(info.userId).catch(() => []),
      ])
      if (!ordersRes.ok) throw new Error()
      const data: OrderDto[] = await ordersRes.json()
      const sorted = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      setOrders(sorted)
      if (sorted.length > 0) setExpandedId(sorted[0].orderId)

      if (quotesRes.ok) {
        const quotes: QuoteDto[] = await quotesRes.json()
        const map: Record<number, CartItem[]> = {}
        quotes.forEach(q => { if (q.convertedOrderId != null) { try { map[q.convertedOrderId] = JSON.parse(q.items || "[]") } catch {} } })
        setQuoteItems(map)
      }
      setReviewedIds(new Set(reviewsRes.map(r => r.orderId)))
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const submitReview = async () => {
    if (!reviewDialog || reviewRating === 0) return
    setSubmitting(true)
    try {
      await Promise.all(
        reviewDialog.items.map(item => createReview({
          orderId: reviewDialog.orderId, itemId: item.itemId,
          customerId: reviewDialog.customerId, rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }))
      )
      setReviewedIds(prev => new Set(prev).add(reviewDialog.orderId))
      setReviewDialog(null)
    } catch {} finally { setSubmitting(false) }
  }

  /* Loading */
  if (loading) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </main>
  )

  return (
    <main className="min-h-screen bg-background">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden border-b border-border/40"
        style={{ background: "linear-gradient(135deg, oklch(0.985 0.005 82) 0%, oklch(0.975 0.010 60) 100%)" }}>
        <div className="absolute -top-20 right-12 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "oklch(0.75 0.06 50)", filter: "blur(80px)", opacity: 0.12 }} />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-[2px] rounded-full bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-accent">My Orders</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary leading-tight mb-2">
                Order Tracking
              </h1>
              <p className="text-muted-foreground text-base">
                Follow your cake from the oven to your door.
              </p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-1">No Orders Yet</h3>
              <p className="text-muted-foreground text-sm">Start by browsing our cakes and placing your first order.</p>
            </div>
            <Link href="/">
              <button className="h-11 px-7 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                Browse Cakes
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const isDelivery = !!order.deliveryAddress || order.status.includes("Delivery") || order.status === "Out for Delivery"
              const items = quoteItems[order.orderId] ?? []
              const first = items[0]
              const title = first
                ? items.length > 1 ? `${first.name} + ${items.length - 1} more` : first.name
                : `Order #ORD-${order.orderId}`
              const image = first?.image
              const isExpanded = expandedId === order.orderId

              return (
                <div key={order.orderId}
                  className="rounded-2xl overflow-hidden border border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md">

                  {/* ── Card header (always visible) ── */}
                  <button
                    onClick={() => setExpandedId(prev => prev === order.orderId ? null : order.orderId)}
                    className="w-full text-left px-6 py-5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {image
                          ? <img src={image} alt={title} className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-semibold text-primary text-base leading-tight">{title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              #ORD-{order.orderId} · {new Date(order.orderDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <StatusPill status={order.status} />
                            <span className="font-serif text-lg font-bold text-primary">
                              Rs. {order.totalAmount.toLocaleString()}
                            </span>
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* ── Expanded panel ── */}
                  {isExpanded && (
                    <div className="border-t border-border/50 px-6 pt-2 pb-6"
                      style={{ background: "oklch(0.995 0.003 82)" }}>

                      {/* Horizontal progress stepper */}
                      <OrderStepper status={order.status} isDelivery={isDelivery} />

                      {/* Divider */}
                      <div className="h-px bg-border/50 mb-5" />

                      {/* Items */}
                      {items.length > 0 && (
                        <div className="mb-5 space-y-1.5">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Items</p>
                          {items.map(item => (
                            <div key={item.cartItemId} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">{item.name} × {item.quantity}</span>
                              <span className="text-muted-foreground font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          {order.deliveryAddress && (
                            <p className="text-xs text-muted-foreground pt-1">
                              <span className="font-semibold">Delivery to:</span> {order.deliveryAddress}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 flex-wrap">
                        <Link href="/support">
                          <button className="h-10 px-5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Contact Baker
                          </button>
                        </Link>
                        {order.status === "Completed" && items.length > 0 && (
                          reviewedIds.has(order.orderId) ? (
                            <span className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                              Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => { setReviewDialog({ orderId: order.orderId, customerId: order.customerId, items }); setReviewRating(0); setReviewComment("") }}
                              className="h-10 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-90"
                              style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
                            >
                              <Star className="w-4 h-4" />
                              Rate your order
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Review dialog ── */}
      <Dialog open={!!reviewDialog} onOpenChange={open => { if (!open) setReviewDialog(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">How was your order?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Tap a star to rate your experience</p>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <Textarea placeholder="Share your experience (optional)…" value={reviewComment}
              onChange={e => setReviewComment(e.target.value)} rows={4} className="resize-none" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)} disabled={submittingReview}>Cancel</Button>
            <Button onClick={submitReview} disabled={reviewRating === 0 || submittingReview}
              className="bg-amber-500 hover:bg-amber-600 text-white">
              {submittingReview ? "Submitting…" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
