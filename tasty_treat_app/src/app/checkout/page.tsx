"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, Truck, CreditCard, Loader2, MapPin, Pencil, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCart, CartItem, convertCartToOrder } from "@/lib/api/cart"
import { getUserInfo, getUserProfile } from "@/lib/api/auth"
import { calculateDeliveryFee, RATE_PER_KM } from "@/lib/delivery"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:55079"

function headers(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const quoteId = searchParams.get("quoteId") ? Number(searchParams.get("quoteId")) : null

  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderId, setOrderId] = useState<number | null>(null)
  const [placing, setPlacing] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState<number>(
    Number(searchParams.get("deliveryFee") ?? 0)
  )
  const [distanceKm, setDistanceKm] = useState<number | null>(
    searchParams.get("distanceKm") ? Number(searchParams.get("distanceKm")) : null
  )
  const [calculatingFee, setCalculatingFee] = useState(false)
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery")
  const [savedAddress, setSavedAddress] = useState("")
  const [editingAddress, setEditingAddress] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    cardNumber: "", cardName: "", expiry: "", cvc: "",
    deliveryDate: "",
  })

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const loadCart = useCallback(async () => {
    const info = getUserInfo()
    if (!info) return
    const { items } = await getCart(info.userId)
    setCartItems(items)
  }, [])

  useEffect(() => {
    loadCart()
    const info = getUserInfo()
    if (!info) return
    getUserProfile(info.userId).then((p) => {
      const addr = p.address ?? ""
      setSavedAddress(addr)
      setFormData((f) => ({
        ...f,
        firstName: p.name.split(" ")[0] ?? "",
        lastName: p.name.split(" ").slice(1).join(" ") ?? "",
        email: p.email,
        phone: p.phoneNo ?? "",
        address: addr,
      }))
    }).catch(() => {})
  }, [loadCart])

  // Reset fee to 0 when switching to pickup
  useEffect(() => {
    if (fulfillmentType === "pickup") {
      setDeliveryFee(0)
      setDistanceKm(null)
    }
  }, [fulfillmentType])

  // Recalculate delivery fee when address fields change (debounced)
  useEffect(() => {
    if (fulfillmentType !== "delivery") return
    const fullAddress = editingAddress
      ? [formData.address, formData.city, formData.state].filter(Boolean).join(", ")
      : savedAddress
    if (fullAddress.trim().length < 6) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setCalculatingFee(true)
      try {
        const result = await calculateDeliveryFee(fullAddress)
        if (result) {
          setDeliveryFee(result.fee)
          setDistanceKm(result.distanceKm)
        }
      } finally {
        setCalculatingFee(false)
      }
    }, 2000)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [formData.address, formData.city, formData.state, editingAddress, savedAddress])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    const info = getUserInfo()
    if (!info || !quoteId) return

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const tax = subtotal * 0.1
    const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100

    try {
      setPlacing(true)

      const orderRes = await fetch(`${API_BASE_URL}/api/Orders`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          customerId: info.userId,
          status: "Pending",
          deliveryAddress: fulfillmentType === "pickup"
            ? null
            : editingAddress
              ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`.trim()
              : savedAddress,
          specialInstructions: "",
          totalAmount: total,
        }),
      })
      if (!orderRes.ok) throw new Error("Failed to create order")
      const order = await orderRes.json()

      await Promise.all(
        cartItems.map((item) =>
          fetch(`${API_BASE_URL}/api/OrderItems`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({
              orderId: order.orderId,
              itemId: item.itemId,
              quantity: item.quantity,
              orderItemPrice: item.price,
              isAvailable: true,
            }),
          })
        )
      )

      await convertCartToOrder(quoteId, order.orderId)
      setOrderId(order.orderId)
      setStep("confirmation")
    } catch {
      alert("Failed to place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax + deliveryFee

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-8">
          {(["shipping", "payment", "confirmation"] as const).map((s, idx) => (
            <div key={s} className={`flex-1 pb-4 border-b-2 transition ${step === s ? "border-primary" : "border-muted"}`}>
              <div className="text-sm font-semibold text-muted-foreground mb-1">Step {idx + 1}</div>
              <div className={`text-lg font-serif capitalize ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-bold text-foreground">Order Details</h2>
                </div>

                {/* Fulfillment picker */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-3">How would you like to receive your order?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType("delivery")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        fulfillmentType === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Truck className="w-5 h-5 mb-2 text-primary" />
                      <p className="font-semibold text-sm text-foreground">Delivery</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Delivered to your door</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType("pickup")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        fulfillmentType === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Package className="w-5 h-5 mb-2 text-primary" />
                      <p className="font-semibold text-sm text-foreground">Pickup</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Collect from our store</p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
                    <Input name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
                    <Input name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                    <Input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                    <Input name="phone" placeholder="+94 77 123 4567" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Delivery Date</label>
                  <Input name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
                </div>
                {/* Delivery Address — only for delivery orders */}
                {fulfillmentType === "delivery" && <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-foreground">Delivery Address</label>
                    {savedAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          if (editingAddress) {
                            // revert to saved
                            setFormData((f) => ({ ...f, address: savedAddress, city: "", state: "", zip: "" }))
                          }
                          setEditingAddress((v) => !v)
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        {editingAddress ? (
                          <><Check className="w-3 h-3" /> Use saved address</>
                        ) : (
                          <><Pencil className="w-3 h-3" /> Use different address</>
                        )}
                      </button>
                    )}
                  </div>

                  {!editingAddress && savedAddress ? (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-secondary/30 text-sm text-foreground">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>{savedAddress}</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input name="address" placeholder="123 Main St" value={formData.address} onChange={handleInputChange} />
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">City</label>
                          <Input name="city" placeholder="Colombo" value={formData.city} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">State</label>
                          <Input name="state" placeholder="Western" value={formData.state} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">ZIP Code</label>
                          <Input name="zip" placeholder="10001" value={formData.zip} onChange={handleInputChange} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>}
              </Card>
            )}

            {step === "payment" && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-bold text-foreground">Payment Information</h2>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Cardholder Name</label>
                  <Input name="cardName" placeholder="John Doe" value={formData.cardName} onChange={handleInputChange} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                  <Input name="cardNumber" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Expiry Date</label>
                    <Input name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">CVC</label>
                    <Input name="cvc" placeholder="123" value={formData.cvc} onChange={handleInputChange} />
                  </div>
                </div>
              </Card>
            )}

            {step === "confirmation" && (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your delicious cakes will be prepared with care and delivered on your chosen date.
                </p>
                {orderId && (
                  <p className="text-foreground mb-8">
                    <span className="text-sm text-muted-foreground">Order Number: </span>
                    <span className="font-semibold">#ORD-{orderId}</span>
                  </p>
                )}
                <Button onClick={() => router.push("/orders")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Track Your Order
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 bg-card border-border">
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 border-b border-border pb-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground">
                  <span>Tax (10%)</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                {fulfillmentType === "delivery" && (
                  <div className="flex justify-between text-sm text-foreground">
                    <span className="flex items-center gap-1">
                      Delivery
                      {distanceKm !== null && (
                        <span className="text-xs text-muted-foreground">({distanceKm} km)</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      {calculatingFee ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : deliveryFee > 0 ? (
                        `Rs. ${deliveryFee.toLocaleString()}`
                      ) : (
                        <span className="text-muted-foreground text-xs italic">enter address</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {fulfillmentType === "delivery" && distanceKm !== null && (
                <div className="flex items-start gap-2 mb-4 p-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Rs. {RATE_PER_KM}/km × {distanceKm} km = Rs. {deliveryFee.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {step === "payment" && (
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("shipping")}>
                    Back
                  </Button>
                )}
                {step === "shipping" && (
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setStep("payment")}>
                    Next: Payment
                  </Button>
                )}
                {step === "payment" && (
                  <Button
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={placing}
                    onClick={handlePlaceOrder}
                  >
                    {placing ? "Placing…" : "Complete Order"}
                  </Button>
                )}
                {step === "confirmation" && (
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push("/")}>
                    Continue Shopping
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
