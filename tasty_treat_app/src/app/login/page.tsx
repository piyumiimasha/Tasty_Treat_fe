"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { login, setAuthData, ApiError } from "@/lib/api/auth"
import { Cake, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login({ email, password })
      setAuthData(response)
      toast({
        title: `Welcome back, ${response.name}!`,
        description: "You've successfully logged in.",
      })
      if (response.role.toLowerCase() === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
      }
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background">
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🎂</div>
          <div className="absolute top-40 right-8 text-7xl">🧁</div>
          <div className="absolute bottom-32 left-20 text-8xl">🎉</div>
          <div className="absolute bottom-10 right-16 text-6xl">🍰</div>
        </div>
        <div className="relative text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Cake className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4">Tasty Treat</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-xs">
            Artisan cakes crafted with love for every sweet occasion.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[["50+", "Cake Designs"], ["100%", "Handcrafted"], ["5★", "Rated"]].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{val}</div>
                <div className="text-xs text-white/70 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-primary">Tasty Treat</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-border/70 bg-secondary/30 focus:border-accent focus:ring-accent/20"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-border/70 bg-secondary/30 pr-12 focus:border-accent focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-md shadow-accent/25 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-accent font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to browsing cakes
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
