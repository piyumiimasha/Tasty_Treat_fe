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

const NAV_LINKS = [
  { href: "/",          label: "Browse"    },
  { href: "/customize", label: "Customize" },
  { href: "/upload",    label: "Upload"    },
  { href: "/support",   label: "Support"   },
  { href: "/orders",    label: "Orders"    },
]

export default function Navigation() {
  const pathname  = usePathname()
  const router    = useRouter()

  const [isLoggedIn, setIsLoggedIn]     = useState(false)
  const [userInfo, setUserInfo]         = useState<UserInfo | null>(null)
  const [scrolled, setScrolled]         = useState(false)
  const [searchValue, setSearchValue]   = useState("")
  const [filterCount, setFilterCount]   = useState(0)
  const [itemCount, setItemCount]       = useState(0)

  const isHomePage       = pathname === "/"
  const isAdmin          = userInfo?.role?.toLowerCase() === "admin"
  const isDeliveryPerson = userInfo?.role?.toLowerCase() === "deliveryperson"

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

  useEffect(() => {
    const handler = (e: Event) => setFilterCount((e as CustomEvent<number>).detail)
    window.addEventListener("filter-count", handler)
    return () => window.removeEventListener("filter-count", handler)
  }, [])

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

  return (
    <>
      {/* ══════════════════════════════════
          Top bar — fixed, full width
      ══════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            : "bg-background border-b border-border/50"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Cake className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-serif text-[1.1rem] font-bold text-primary tracking-tight">Tasty Treat</span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2">

          {/* Search + Filters — home only */}
          {isHomePage && !isDeliveryPerson && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search cakes…"
                  className="w-44 h-8 pl-9 pr-7 rounded-full border border-border bg-secondary/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 focus:w-56 transition-all duration-300"
                />
                {searchValue && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-filters"))}
                className="relative flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-secondary/60 text-xs font-medium text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <SlidersHorizontal className="w-3 h-3" />
                Filters
                {filterCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Admin / Delivery role badge */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`hidden sm:inline-flex px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Admin
            </Link>
          )}
          {isDeliveryPerson && (
            <Link
              href="/delivery"
              className={`hidden sm:inline-flex px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                pathname.startsWith("/delivery")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Deliveries
            </Link>
          )}

          {isLoggedIn && <NotificationBell />}

          {/* Cart */}
          {!isDeliveryPerson && (
            <Link
              href="/cart"
              className={`relative flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                pathname === "/cart"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "bg-accent/10 text-accent hover:bg-accent hover:text-white"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* User menu */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full gap-1 px-2 h-8 hover:bg-muted">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-border/60 p-1">
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
              <Button size="sm" className="rounded-full gap-1.5 h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                <LogIn className="w-3 h-3" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════
          Left sidebar — rotated nav links
      ══════════════════════════════════ */}
      {!isDeliveryPerson && (
        <nav className="fixed left-0 top-14 bottom-0 z-40 w-10 flex flex-col items-center justify-evenly bg-background border-r border-border/40">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 hover:text-accent select-none ${
                pathname === link.href ? "text-accent" : "text-foreground/35 hover:text-foreground/70"
              }`}
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
