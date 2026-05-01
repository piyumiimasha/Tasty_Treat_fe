"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Cake, ArrowLeft, MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setEmailSent(true)
      setIsLoading(false)
      toast({
        title: "Email sent!",
        description: "Check your inbox for password reset instructions.",
      })
    }, 1000)
  }

  return (
    <main className="flex min-h-screen bg-background">

      {/* ── Decorative left panel ── */}
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

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-primary">Tasty Treat</span>
          </div>

          {!emailSent ? (
            <>
              <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-primary mb-2">Forgot password?</h1>
                <p className="text-muted-foreground">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-md shadow-accent/25 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-6">
                  <MailCheck className="w-7 h-7 text-accent" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary mb-2">Check your inbox</h1>
                <p className="text-muted-foreground leading-relaxed">
                  We&apos;ve sent a reset link to{" "}
                  <span className="font-semibold text-foreground">{email}</span>.
                  Follow the instructions in the email to reset your password.
                </p>
              </div>

              <Button
                onClick={() => { setEmailSent(false); setEmail("") }}
                variant="outline"
                className="w-full h-12 rounded-xl border-border/70 font-semibold text-muted-foreground hover:text-foreground"
              >
                Try a different email
              </Button>
            </>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
