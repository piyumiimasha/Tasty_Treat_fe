"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrderManagement from "@/components/admin/order-management"
import CustomizationRequests from "@/components/admin/customization-requests"
import DesignerOptions from "@/components/admin/designer-options"
import CakeManagement from "@/components/admin/cake-management"
import Link from "next/link"
import { BarChart2 } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders")

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage orders, customizations, cake catalog, and designer options</p>
          </div>
          <Link
            href="/admin/statistics"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            Statistics
          </Link>
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
