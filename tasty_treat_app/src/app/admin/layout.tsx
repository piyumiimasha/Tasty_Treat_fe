"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserInfo } from "@/lib/api/auth"
import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAdminAccess = () => {
      const userInfo = getUserInfo()
      
      // Check if user is logged in and has admin role
      if (!userInfo) {
        router.push("/login")
        return
      }

      if (userInfo.role.toLowerCase() !== "admin") {
        router.push("/")
        return
      }

      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAdminAccess()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
