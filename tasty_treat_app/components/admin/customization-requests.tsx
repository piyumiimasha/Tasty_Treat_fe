"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Image from "next/image"

// Mock data
const mockRequests = [
  {
    id: "REQ-001",
    customer: "Sarah Johnson",
    type: "Wedding Cake",
    message: "Looking for a romantic design with roses and gold accents",
    image: "/wedding-cake-design.jpg",
    uploadDate: "2025-12-23",
    status: "pending",
  },
  {
    id: "REQ-002",
    customer: "Mike Chen",
    type: "Birthday Cake",
    message: "Need a galaxy-themed cake for a 30th birthday party",
    image: "/galaxy-cake.jpg",
    uploadDate: "2025-12-22",
    status: "reviewed",
  },
  {
    id: "REQ-003",
    customer: "Emma Davis",
    type: "Custom Dessert",
    message: "Gluten-free vegan cupcakes with colorful decorations",
    image: "/vegan-cupcakes.jpg",
    uploadDate: "2025-12-21",
    status: "approved",
  },
]

export default function CustomizationRequests() {
  const [requests, setRequests] = useState(mockRequests)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRequests = requests.filter(
    (req) =>
      req.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const updateRequestStatus = (id, newStatus) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)))
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization Requests</CardTitle>
        <CardDescription>View customer uploads, design requests, and messages</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by customer name or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <div key={req.id} className="overflow-hidden rounded-lg border bg-card">
              {/* Image */}
              <div className="relative h-48 w-full bg-muted">
                <Image src={req.image || "/placeholder.svg"} alt={req.type} fill className="object-cover" />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{req.id}</p>
                    <h3 className="text-sm font-semibold">{req.customer}</h3>
                  </div>
                  <Badge className={statusColors[req.status]}>{req.status}</Badge>
                </div>

                <p className="mb-3 text-xs font-medium text-muted-foreground">{req.type}</p>
                <p className="mb-4 text-sm leading-relaxed text-foreground">{req.message}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(req.id, "reviewed")}
                        className="flex-1"
                      >
                        Review
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => updateRequestStatus(req.id, "approved")}>
                        Approve
                      </Button>
                    </>
                  )}
                  {req.status === "reviewed" && (
                    <Button size="sm" className="w-full" onClick={() => updateRequestStatus(req.id, "approved")}>
                      Approve
                    </Button>
                  )}
                  {req.status === "approved" && (
                    <Button disabled size="sm" className="w-full bg-transparent" variant="outline">
                      Approved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
