"use client"
import { useState } from "react"
import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Check, Palette, Truck, ChefHat, MessageCircle } from "lucide-react"

interface OrderStage {
  name: string
  status: "completed" | "in-progress" | "pending"
  icon: React.ReactNode
  timestamp?: string
}

interface Order {
  id: string
  cakeName: string
  image: string
  orderDate: string
  pickupDate: string
  price: number
  stages: OrderStage[]
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    cakeName: "Elegant Wedding Cake",
    image: "/wedding-cake.jpg",
    orderDate: "Dec 15, 2025",
    pickupDate: "Dec 25, 2025",
    price: 450,
    stages: [
      {
        name: "Order Confirmed",
        status: "completed",
        icon: <Check className="w-5 h-5" />,
        timestamp: "Dec 15, 10:30 AM",
      },
      {
        name: "Design & Planning",
        status: "completed",
        icon: <Palette className="w-5 h-5" />,
        timestamp: "Dec 17, 2:15 PM",
      },
      {
        name: "Baking & Preparation",
        status: "in-progress",
        icon: <ChefHat className="w-5 h-5" />,
        timestamp: "In progress",
      },
      {
        name: "Decoration",
        status: "pending",
        icon: <Palette className="w-5 h-5" />,
        timestamp: "Scheduled",
      },
      {
        name: "Ready for Pickup",
        status: "pending",
        icon: <Package className="w-5 h-5" />,
        timestamp: "Dec 25",
      },
    ],
  },
  {
    id: "ORD-002",
    cakeName: "Birthday Chocolate Dream",
    image: "/decadent-chocolate-cake.png",
    orderDate: "Dec 10, 2025",
    pickupDate: "Dec 20, 2025",
    price: 280,
    stages: [
      {
        name: "Order Confirmed",
        status: "completed",
        icon: <Check className="w-5 h-5" />,
        timestamp: "Dec 10, 3:45 PM",
      },
      {
        name: "Design & Planning",
        status: "completed",
        icon: <Palette className="w-5 h-5" />,
        timestamp: "Dec 12, 1:00 PM",
      },
      {
        name: "Baking & Preparation",
        status: "completed",
        icon: <ChefHat className="w-5 h-5" />,
        timestamp: "Dec 18, 4:30 PM",
      },
      {
        name: "Decoration",
        status: "completed",
        icon: <Palette className="w-5 h-5" />,
        timestamp: "Dec 19, 3:00 PM",
      },
      {
        name: "Ready for Pickup",
        status: "in-progress",
        icon: <Package className="w-5 h-5" />,
        timestamp: "Ready Dec 20",
      },
    ],
  },
]

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(mockOrders[0].id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Follow your cake from preparation through delivery</p>
        </div>

        <div className="space-y-6">
          {mockOrders.map((order) => (
            <Card key={order.id} className="border border-border overflow-hidden">
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-6 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={order.image || "/placeholder.svg"}
                      alt={order.cakeName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{order.cakeName}</h3>
                      <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Ordered: {order.orderDate}</span>
                        <span>Pickup: {order.pickupDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-primary">Rs. {order.price}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {expandedOrder === order.id ? "Click to collapse" : "Click to expand"}
                    </p>
                  </div>
                </div>
              </button>

              {/* Order Timeline */}
              {expandedOrder === order.id && (
                <div className="border-t border-border p-6 bg-background/50">
                  <div className="space-y-4">
                    {order.stages.map((stage, idx) => (
                      <div key={idx} className="flex gap-4">
                        {/* Timeline Node */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              stage.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : stage.status === "in-progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {stage.icon}
                          </div>
                          {idx < order.stages.length - 1 && (
                            <div
                              className={`w-0.5 h-12 mt-2 ${
                                stage.status === "completed" ? "bg-emerald-200" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>

                        {/* Stage Info */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground">{stage.name}</h4>
                            {getStatusBadge(stage.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{stage.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                    <Button variant="outline" className="flex-1 border border-border bg-transparent">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Baker
                    </Button>
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Truck className="w-4 h-4 mr-2" />
                      Arrange Delivery
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockOrders.length === 0 && (
          <Card className="p-12 text-center border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">Start by customizing and ordering your perfect cake</p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Our Cakes</Button>
          </Card>
        )}
      </div>
    </main>
  )
}
