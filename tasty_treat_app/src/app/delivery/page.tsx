"use client"

import { useEffect, useState, useCallback } from "react"
import { Truck, PackageCheck, MapPin, Calendar, DollarSign, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getOrdersByStatus, updateOrder, type OrderDto } from "@/lib/api/orders"

export default function DeliveryPage() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<number | null>(null)
  const { toast } = useToast()

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
          {orders.map(order => (
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
          ))}
        </div>
      )}
    </div>
  )
}
