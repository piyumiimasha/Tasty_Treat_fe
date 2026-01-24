"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

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
          </div>
        </div>
      </div>
    </nav>
  )
}
