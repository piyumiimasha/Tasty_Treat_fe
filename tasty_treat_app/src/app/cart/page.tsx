"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCart, updateCartItemQuantity, removeCartItem, CartItem } from "@/lib/api/cart"
import { getUserInfo, getUserProfile } from "@/lib/api/auth"
import { calculateDeliveryFee, RATE_PER_KM } from "@/lib/delivery"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [quoteId, setQuoteId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [calculatingFee, setCalculatingFee] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [customerAddress, setCustomerAddress] = useState<string>("")

  const loadCart = useCallback(async (uid: number) => {
    const { quoteId: qid, items } = await getCart(uid)
    setQuoteId(qid)
    setCartItems(items)
  }, [])

  useEffect(() => {
    const info = getUserInfo()
    if (!info) { setLoading(false); return }
    setUserId(info.userId)

    Promise.all([
      loadCart(info.userId),
      getUserProfile(info.userId).then(p => { if (p.address) setCustomerAddress(p.address) }).catch(() => {}),
    ]).finally(() => setLoading(false))

    const onUpdate = () => loadCart(info.userId)
    window.addEventListener("cart-updated", onUpdate)
    return () => window.removeEventListener("cart-updated", onUpdate)
  }, [loadCart])

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (!userId) return
    if (quantity <= 0) await removeCartItem(userId, cartItemId)
    else await updateCartItemQuantity(userId, cartItemId, quantity)
  }

  const handleRemove = async (cartItemId: string) => {
    if (!userId) return
    await removeCartItem(userId, cartItemId)
  }

  const handleProceedToCheckout = async () => {
    if (!customerAddress) {
      // No address saved — go straight to checkout, fee calculated there
      router.push(`/checkout?quoteId=${quoteId}`)
      return
    }

    setCalculatingFee(true)
    try {
      const result = await calculateDeliveryFee(customerAddress)
      if (!result) throw new Error("Could not resolve address")
      const { fee, distanceKm: km } = result
      setDeliveryFee(fee)
      setDistanceKm(km)
      router.push(`/checkout?quoteId=${quoteId}&deliveryFee=${fee}&distanceKm=${km}`)
    } catch {
      toast({
        title: "Could not calculate delivery fee",
        description: "Update your address in Profile or we'll calculate it at checkout.",
        variant: "destructive",
      })
      router.push(`/checkout?quoteId=${quoteId}`)
    } finally {
      setCalculatingFee(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    )
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center py-20 max-w-md">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-3xl font-bold text-primary mb-3">Please Log In</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in to view your cart.</p>
          <Link href="/login"><Button className="rounded-full px-8 bg-accent hover:bg-accent/90 text-white">Log In</Button></Link>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center py-20 max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-9 h-9 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Browse our collection of exquisite cakes and add something delicious.
          </p>
          <Link href="/">
            <Button className="rounded-full px-8 bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25">
              Browse Cakes
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full bg-gradient-to-r from-secondary/50 to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="font-serif text-4xl font-bold text-primary mb-1">Shopping Cart</h1>
          <p className="text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-5 p-5 bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-semibold text-foreground text-lg leading-tight mb-0.5">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-0.5">Size: {item.size}</p>
                  <p className="text-sm text-muted-foreground mb-3">Flavor: {item.flavor}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="text-xl font-bold text-primary font-serif">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(item.cartItemId)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Package className="w-4 h-4" />
              <span>All cakes are freshly made and delivered within 2–3 business days.</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border/60 p-6 sticky top-24 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6">Order Summary</h2>

              <div className="space-y-3 pb-5 border-b border-border/60 mb-5">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="font-medium text-foreground flex-shrink-0">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pb-5 border-b border-border/60 mb-5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total</span>
                  <span className="font-medium text-foreground">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax (10%)</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-xs text-muted-foreground italic">calculated at checkout</span>
                </div>
              </div>

              {/* Delivery address hint */}
              {customerAddress ? (
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Delivering to: <span className="text-foreground font-medium">{customerAddress}</span><br />Rs. {RATE_PER_KM}/km applies.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Add your address in <Link href="/profile" className="underline text-primary">Profile</Link> for a delivery estimate. Rs. {RATE_PER_KM}/km.</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-semibold text-foreground"></span>
                <span className="text-2xl font-bold text-primary font-serif">Rs. {total.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleProceedToCheckout}
                disabled={calculatingFee}
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold shadow-md shadow-accent/25 gap-2"
              >
                {calculatingFee ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating delivery…
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Link href="/" className="block mt-3">
                <Button variant="outline" className="w-full rounded-xl border-border/70 text-muted-foreground hover:text-foreground">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
