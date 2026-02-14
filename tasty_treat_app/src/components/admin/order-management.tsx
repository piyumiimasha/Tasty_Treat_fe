"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const mockOrders = [
  {
    id: "ORD-001",
    customer: "Sarah Johnson",
    cakeType: "Wedding Cake",
    price: "Rs. 250",
    status: "in-progress",
    date: "2025-12-23",
    stage: "decoration",
  },
  {
    id: "ORD-002",
    customer: "Mike Chen",
    cakeType: "Birthday Cake",
    price: "Rs. 85",
    status: "pending",
    date: "2025-12-24",
    stage: "preparation",
  },
  {
    id: "ORD-003",
    customer: "Emma Davis",
    cakeType: "Cupcakes (24)",
    price: "Rs. 45",
    status: "completed",
    date: "2025-12-22",
    stage: "delivered",
  },
  {
    id: "ORD-004",
    customer: "James Wilson",
    cakeType: "Dessert Platter",
    price: "Rs. 120",
    status: "in-progress",
    date: "2025-12-23",
    stage: "preparation",
  },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
}

const stageLabels = {
  preparation: "Preparation",
  decoration: "Decoration",
  delivery: "Ready for Delivery",
  delivered: "Delivered",
}

export default function OrderManagement() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const updateOrderStage = (orderId: string, newStage: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, stage: newStage } : order)))
  }

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
            placeholder="Search by order ID or customer name..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cake Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                  <td className="px-4 py-3 text-sm">{order.customer}</td>
                  <td className="px-4 py-3 text-sm">{order.cakeType}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{order.price}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Select value={order.stage} onValueChange={(value) => updateOrderStage(order.id, value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preparation">Preparation</SelectItem>
                        <SelectItem value="decoration">Decoration</SelectItem>
                        <SelectItem value="delivery">Ready for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
