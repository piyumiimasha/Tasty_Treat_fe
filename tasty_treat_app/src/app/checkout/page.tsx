"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CheckoutPage() {
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
    deliveryDate: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (step === "shipping") {
      setStep("payment")
    } else if (step === "payment") {
      setStep("confirmation")
    }
  }

  const handleBack = () => {
    if (step === "payment") {
      setStep("shipping")
    } else if (step === "confirmation") {
      setStep("payment")
    }
  }

  const subtotal = 155
  const tax = 15.5
  const delivery = 0
  const total = subtotal + tax + delivery

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-8">
          <div
            className={`flex-1 pb-4 border-b-2 transition ${step === "shipping" ? "border-primary" : "border-muted"}`}
          >
            <div className="text-sm font-semibold text-muted-foreground mb-1">Step 1</div>
            <div className={`text-lg font-serif ${step === "shipping" ? "text-foreground" : "text-muted-foreground"}`}>
              Shipping
            </div>
          </div>
          <div
            className={`flex-1 pb-4 border-b-2 transition ${step === "payment" ? "border-primary" : "border-muted"}`}
          >
            <div className="text-sm font-semibold text-muted-foreground mb-1">Step 2</div>
            <div className={`text-lg font-serif ${step === "payment" ? "text-foreground" : "text-muted-foreground"}`}>
              Payment
            </div>
          </div>
          <div
            className={`flex-1 pb-4 border-b-2 transition ${step === "confirmation" ? "border-primary" : "border-muted"}`}
          >
            <div className="text-sm font-semibold text-muted-foreground mb-1">Step 3</div>
            <div
              className={`text-lg font-serif ${step === "confirmation" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Confirmation
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Shipping Form */}
            {step === "shipping" && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-bold text-foreground">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
                    <Input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
                    <Input name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                    <Input
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Delivery Date</label>
                  <Input name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleInputChange} />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Street Address</label>
                  <Input
                    name="address"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">City</label>
                    <Input name="city" placeholder="New York" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">State</label>
                    <Input name="state" placeholder="NY" value={formData.state} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">ZIP Code</label>
                    <Input name="zip" placeholder="10001" value={formData.zip} onChange={handleInputChange} />
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Form */}
            {step === "payment" && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-bold text-foreground">Payment Information</h2>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Cardholder Name</label>
                  <Input
                    name="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                  <Input
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
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

            {/* Confirmation */}
            {step === "confirmation" && (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your delicious cakes will be prepared with care and delivered on your chosen date.
                </p>
                <p className="text-foreground mb-8">
                  <span className="text-sm text-muted-foreground">Order Number: </span>
                  <span className="font-semibold">#AC-{Math.floor(Math.random() * 10000)}</span>
                </p>
                <p className="text-muted-foreground mb-8">
                  A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
                </p>
                <Link href="/orders">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Track Your Order</Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 bg-card border-border">
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Elegant Wedding Cake</span>
                  <span className="font-semibold">Rs. 85.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chocolate Birthday Cake (x2)</span>
                  <span className="font-semibold">Rs. 90.00</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Tax</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {step !== "shipping" && (
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {step !== "confirmation" && (
                  <Button
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleNext}
                  >
                    {step === "shipping" ? "Next: Payment" : "Complete Order"}
                  </Button>
                )}
                {step === "confirmation" && (
                  <Link href="/" className="block flex-1">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Continue Shopping
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
