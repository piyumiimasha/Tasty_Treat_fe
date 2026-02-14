"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrderManagement from "@/components/admin/order-management"
import CustomizationRequests from "@/components/admin/customization-requests"
import DesignerOptions from "@/components/admin/designer-options"
import CakeManagement from "@/components/admin/cake-management"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders")

  // Mock statistics
  const stats = [
    { label: "Total Orders", value: 24, color: "bg-primary" },
    { label: "Pending Requests", value: 8, color: "bg-accent" },
    { label: "In Progress", value: 12, color: "bg-secondary" },
    { label: "Completed", value: 4, color: "bg-green-500" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage orders, customizations, cake catalog, and designer options</p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 border-b bg-transparent">
            <TabsTrigger value="orders" className="border-b-2 border-transparent data-[state=active]:border-primary">
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="customization"
              className="border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Customization Requests
            </TabsTrigger>
            <TabsTrigger value="cakes" className="border-b-2 border-transparent data-[state=active]:border-primary">
              Cake Catalog
            </TabsTrigger>
            <TabsTrigger value="designer" className="border-b-2 border-transparent data-[state=active]:border-primary">
              Designer Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="customization" className="mt-6">
            <CustomizationRequests />
          </TabsContent>

          <TabsContent value="cakes" className="mt-6">
            <CakeManagement />
          </TabsContent>

          <TabsContent value="designer" className="mt-6">
            <DesignerOptions />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
