"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AdminAuthGuardProps {
  children: ReactNode
}

// Simple mock auth check - in production, verify with backend/session
const isAdminUser = () => {
  // Check if admin token exists in localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken") === "true"
  }
  return false
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authorized = isAdminUser()
    setIsAuthorized(authorized)
    setIsLoading(false)

    if (!authorized) {
      // Users must click "Go to Login" button
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mb-6 text-muted-foreground">You need admin credentials to access this page.</p>
            <Button
              onClick={() => {
                console.log("[v0] Navigating to login page")
                router.push("/admin/login")
              }}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
