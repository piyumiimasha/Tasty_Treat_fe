"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, LogOut, LogIn, User } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getUserInfo, logout, type UserInfo } from "@/lib/api/auth"

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      if (authenticated) {
        setUserInfo(getUserInfo())
      } else {
        setUserInfo(null)
      }
    }
    
    checkAuth()
    // Listen for storage changes (in case of login in another tab)
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUserInfo(null)
    router.push("/login")
  }

  const navLinks = [
    { href: "/", label: "Browse Cakes" },
    { href: "/upload", label: "Upload Design" },
    { href: "/support", label: "Support Chat" },
    { href: "/orders", label: "Track Order" },
  ]

  const adminLinks = [{ href: "/admin", label: "Admin Dashboard" }]

  return (
    <nav className="bg-accent text-accent-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold"></h1>
          <div className="flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  pathname === link.href ? "text-white border-b-2 border-white pb-1" : "hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className={`flex items-center gap-2 font-medium transition-colors ${
                pathname === "/cart" ? "text-white border-b-2 border-white pb-1" : "hover:text-white"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
            </Link>
            <div className="ml-4 border-l border-accent-foreground/30 pl-6">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    pathname.startsWith(link.href) ? "text-white border-b-2 border-white pb-1" : "hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="ml-4 border-l border-accent-foreground/30 pl-6">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {userInfo && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-accent-foreground/10 rounded-md">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{userInfo.name}</span>
                      {userInfo.role && (
                        <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                          {userInfo.role}
                        </span>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-accent-foreground hover:text-white hover:bg-accent-foreground/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent-foreground hover:text-white hover:bg-accent-foreground/10"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
