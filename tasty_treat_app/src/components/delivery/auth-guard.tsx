"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getUserInfo } from "@/lib/api/auth"

interface DeliveryAuthGuardProps {
  children: ReactNode
}

export default function DeliveryAuthGuard({ children }: DeliveryAuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = isAuthenticated()
    const info = getUserInfo()
    const authorized = auth && info?.role === "DeliveryPerson"
    setIsAuthorized(authorized)
    setIsLoading(false)
  }, [])

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
            <p className="mb-6 text-muted-foreground">You need delivery person credentials to access this page.</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
