"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Check } from "lucide-react"
import Link from "next/link"
import { DesignRequestDto, getAllDesignRequests, updateDesignRequestStatus } from "@/lib/api/design-requests"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
}

export default function CustomizationRequests() {
  const [requests, setRequests] = useState<DesignRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await getAllDesignRequests()
      setRequests(data)
    } catch {
      toast({ title: "Error", description: "Failed to load requests", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const updated = await updateDesignRequestStatus(id, "approved")
      setRequests((prev) => prev.map((r) => (r.designRequestId === id ? updated : r)))
      toast({ title: "Approved", description: "Request has been approved." })
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  const filteredRequests = requests.filter(
    (req) =>
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.message ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization Requests</CardTitle>
        <CardDescription>View customer uploads and design requests</CardDescription>
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {requests.length === 0 ? "No design requests yet." : "No requests match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((req) => (
              <div key={req.designRequestId} className="overflow-hidden rounded-lg border bg-card">
                {/* Image */}
                <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                  {req.imageUrl ? (
                    <img
                      src={req.imageUrl}
                      alt="Design"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No image</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">#{req.designRequestId}</p>
                      <h3 className="text-sm font-semibold">{req.customerName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={STATUS_STYLES[req.status] ?? "bg-gray-100 text-gray-800"}>
                      {req.status}
                    </Badge>
                  </div>

                  {req.message && (
                    <p className="mb-4 text-sm leading-relaxed text-foreground line-clamp-3">{req.message}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href="/support" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chat
                      </Button>
                    </Link>
                    {req.status === "pending" && (
                      <Button size="sm" className="flex-1 gap-1.5" onClick={() => handleApprove(req.designRequestId)}>
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    {req.status === "approved" && (
                      <Button disabled size="sm" variant="outline" className="flex-1 bg-transparent">
                        Approved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
