"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { register, setAuthData, ApiError } from "@/lib/api/auth"
import { Cake, Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [address, setAddress] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const response = await register({
        name, email, password, role: "Customer",
        phoneNo: phoneNo || undefined,
        address: address || undefined,
      })
      setAuthData(response)
      toast({ title: `Welcome, ${response.name}!`, description: "Your account has been created successfully." })
      router.push("/")
    } catch (error) {
      if (error instanceof ApiError) {
        toast({ title: "Registration Failed", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
      }
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background">
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-accent via-accent/90 to-primary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-8 text-8xl">🎂</div>
          <div className="absolute top-48 right-6 text-6xl">✨</div>
          <div className="absolute bottom-36 left-16 text-7xl">🧁</div>
          <div className="absolute bottom-12 right-12 text-5xl">🍰</div>
        </div>
        <div className="relative text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Cake className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4">Join Tasty Treat</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-xs">
            Create your account and start ordering handcrafted cakes today.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-primary">Tasty Treat</span>
          </div>

          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">Create account</h1>
            <p className="text-muted-foreground">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <Input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-xl border-border/70 bg-secondary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-xl border-border/70 bg-secondary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="h-11 rounded-xl border-border/70 bg-secondary/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Confirm</label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="h-11 rounded-xl border-border/70 bg-secondary/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="tel"
                placeholder="+94 77 123 4567"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-xl border-border/70 bg-secondary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                Delivery Address <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                placeholder="123 Main St, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading}
                className="h-11 rounded-xl border-border/70 bg-secondary/30"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-md shadow-accent/25 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-3 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to browsing cakes
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
