"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, LogOut, LogIn, User, ChevronDown, Cake, Search, X, SlidersHorizontal } from "lucide-react"
import NotificationBell from "@/components/notification-bell"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getUserInfo, logout, type UserInfo } from "@/lib/api/auth"
import { getCart } from "@/lib/api/cart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navigation() {
  const pathname    = usePathname()
  const router      = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo]     = useState<UserInfo | null>(null)
  const [scrolled, setScrolled]       = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [filterCount, setFilterCount] = useState(0)
  const [itemCount, setItemCount]     = useState(0)

  const isHomePage = pathname === "/"

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      setUserInfo(authenticated ? getUserInfo() : null)
    }
    checkAuth()
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* listen for filter-count updates from cake-browser */
  useEffect(() => {
    const handler = (e: Event) => setFilterCount((e as CustomEvent<number>).detail)
    window.addEventListener("filter-count", handler)
    return () => window.removeEventListener("filter-count", handler)
  }, [])

  /* cart count */
  useEffect(() => {
    const fetchCount = async () => {
      const info = getUserInfo()
      if (!info) { setItemCount(0); return }
      const { items } = await getCart(info.userId)
      setItemCount(items.reduce((s, i) => s + i.quantity, 0))
    }
    fetchCount()
    window.addEventListener("cart-updated", fetchCount)
    return () => window.removeEventListener("cart-updated", fetchCount)
  }, [isLoggedIn])

  /* reset search + filter badge when navigating away from home */
  useEffect(() => {
    if (!isHomePage) {
      setSearchValue("")
      setFilterCount(0)
      window.dispatchEvent(new CustomEvent("cake-search", { detail: "" }))
    }
  }, [isHomePage])

  const handleSearch = (value: string) => {
    setSearchValue(value)
    window.dispatchEvent(new CustomEvent("cake-search", { detail: value }))
  }

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUserInfo(null)
    router.push("/login")
  }

  const navLinks = [
    { href: "/",          label: "Browse"         },
    { href: "/customize", label: "Customize Cake"  },
    { href: "/upload",    label: "Upload Design"   },
    { href: "/support",   label: "Support"         },
    { href: "/orders",    label: "Track Order"     },
  ]

  const isAdmin = userInfo?.role?.toLowerCase() === "admin"

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/96 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.07)]"
          : "bg-white border-b border-border/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-4">

          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Cake className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-[1.15rem] font-bold text-primary tracking-tight whitespace-nowrap">
              Tasty Treat
            </span>
          </Link>

          {/* ── Search bar + Filters button (home page only) ── */}
          {isHomePage && (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              {/* search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search cakes…"
                  className="w-full h-9 pl-9 pr-8 rounded-full border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
                {searchValue && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* filters button */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-filters"))}
                className="relative flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border bg-secondary/50 text-sm font-medium text-foreground hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {filterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ── Nav links ── */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-accent bg-accent/10"
                    : "text-foreground/65 hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className={`flex items-center gap-2 ${isHomePage ? "" : "ml-auto"}`}>
            {isAdmin && (
              <Link
                href="/admin"
                className={`hidden lg:inline-flex px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                Admin
              </Link>
            )}

            {isLoggedIn && <NotificationBell />}

            <Link
              href="/cart"
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pathname === "/cart"
                  ? "bg-accent text-white shadow-md shadow-accent/25"
                  : "bg-accent/10 text-accent hover:bg-accent hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full gap-1.5 px-3 hover:bg-muted">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/60 p-1">
                  <DropdownMenuLabel className="rounded-lg bg-muted/50 mb-1">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">{userInfo?.name}</p>
                      <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="rounded-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
