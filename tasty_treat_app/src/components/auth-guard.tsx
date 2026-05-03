"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAuthToken, isTokenExpired, logout } from "@/lib/api/auth"

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/admin/login"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/icon")
      
      if (isPublicRoute) {
        setIsChecking(false)
        return
      }

      const token = getAuthToken()
      
      // Check if user has a token
      if (!token) {
        router.push("/login")
        return
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        logout() // Clear expired token
        router.push("/login")
        return
      }

      // User is authenticated with valid token
      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router])

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/icon")

  if (isChecking && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

