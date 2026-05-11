"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

import { getAllOrders, updateOrder, OrderDto } from "@/lib/api/orders"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'
function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}


const STATUS_OPTIONS = ["Pending", "Baking", "Decoration", "Ready for Pickup", "Completed", "Cancelled"]

const statusColor: Record<string, string> = {
  "Pending":          "bg-amber-100 text-amber-800",
  "Baking":           "bg-orange-100 text-orange-800",
  "Decoration":       "bg-purple-100 text-purple-800",
  "Ready for Pickup": "bg-teal-100 text-teal-800",
  "Completed":        "bg-green-100 text-green-800",
  "Cancelled":        "bg-red-100 text-red-800",
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [userNames, setUserNames] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [updating, setUpdating] = useState<number | null>(null)
  const { toast } = useToast()

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const [data, usersRes] = await Promise.all([
        getAllOrders(),
        fetch(`${API_BASE_URL}/api/Users`, { headers: headers() }),
      ])
      setOrders(data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()))
      if (usersRes.ok) {
        const users: { userId: number; name: string }[] = await usersRes.json()
        setUserNames(Object.fromEntries(users.map((u) => [u.userId, u.name])))
      }
    } catch {
      toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadOrders() }, [loadOrders])

  const updateStatus = async (orderId: number, status: string) => {
    try {
      setUpdating(orderId)
      await updateOrder(orderId, { status })
      setOrders((prev) => prev.map((o) => o.orderId === orderId ? { ...o, status } : o))
      toast({ title: "Updated", description: `Order #ORD-${orderId} status set to ${status}.` })
    } catch {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const filtered = orders.filter((o) => {
    const name = userNames[o.customerId] ?? ""
    const matchSearch =
      `ORD-${o.orderId}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === "all" || o.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>View and manage all customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search by order ID or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Delivery Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="flex justify-center">
                      <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">#ORD-{order.orderId}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{userNames[order.customerId] ?? `Customer #${order.customerId}`}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">Rs. {order.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">
                      {order.deliveryAddress || "â€”"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Select
                        value={order.status}
                        onValueChange={(val) => updateStatus(order.orderId, val)}
                        disabled={updating === order.orderId}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? "bg-muted text-foreground"}`}>
                              {order.status}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

