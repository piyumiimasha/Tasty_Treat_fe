import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lato } from "next/font/google"
import Navigation from "@/components/navigation"
import AuthGuard from "@/components/auth-guard"
import { Toaster } from "@/components/ui/toaster"
// @ts-ignore: Cannot find module or type declarations for side-effect import of './globals.css'.
import "./globals.css"

const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const _lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tasty Treat — Artisan Cake Boutique",
  description:
    "Browse, customize, and order exquisite handcrafted cakes for every occasion. Wedding cakes, birthday cakes, cupcakes and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_playfair.variable} ${_lato.variable} font-sans antialiased`}>
        <Navigation />
        <AuthGuard>{children}</AuthGuard>
        <Toaster />
      </body>
    </html>
  )
}
