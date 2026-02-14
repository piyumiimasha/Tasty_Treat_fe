"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/icon")
      const userToken = localStorage.getItem("userToken")
      const adminToken = localStorage.getItem("adminToken")
      const isAuthenticated = userToken || adminToken

      if (!isPublicRoute && !isAuthenticated) {
        router.push("/login")
      } else {
        setIsChecking(false)
      }
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
