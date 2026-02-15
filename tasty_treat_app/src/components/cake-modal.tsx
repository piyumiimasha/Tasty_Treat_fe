"use client"

import { X, ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cake } from "@/lib/mappers/item-mapper"

const WEIGHT_OPTIONS = ["0.5 kg", "1 kg", "1.5 kg", "2 kg", "2.5 kg", "3 kg"]
const FLAVOR_OPTIONS = ["Vanilla", "Chocolate", "Strawberry", "Red Velvet", "Lemon", "Carrot"]

interface CakeModalProps {
  cake: Cake
  onClose: () => void
}

export default function CakeModal({ cake, onClose }: CakeModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(cake.size)
  const [selectedFlavor, setSelectedFlavor] = useState(cake.flavor.split(" ")[0] || "Vanilla")

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % cake.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + cake.images.length) % cake.images.length)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-2xl font-bold text-primary">{cake.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              <img
                src={cake.images[currentImageIndex] || "/placeholder.svg"}
                alt={`${cake.name} view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {cake.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 rounded-full text-sm text-muted-foreground backdrop-blur-sm">
                {currentImageIndex + 1} / {cake.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {cake.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {cake.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? "border-primary" : "border-border"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Price and Category */}
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                {cake.category}
              </div>
              <div className="flex items-end gap-4 mb-2">
                <h3 className="text-4xl font-bold text-primary">Rs. {cake.price}</h3>
              </div>
              <p className="text-muted-foreground">{cake.flavor}</p>
            </div>

            {/* Rating */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-2xl ${i < Math.floor(cake.rating) ? "⭐" : "☆"}`} />
              ))}
            </div>

            {/* Flavor and Weight Selection */}
            <div className="space-y-4 pb-6 border-b border-border">
              {/* Flavor Dropdown */}
              <div>
                <label className="text-sm font-medium mb-2 block">Flavor</label>
                <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FLAVOR_OPTIONS.map((flavor) => (
                      <SelectItem key={flavor} value={flavor}>
                        {flavor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Dropdown - Only show for non-cupcake items */}
              {!cake.size.includes("pieces") && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Weight</label>
                  <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((weight) => (
                        <SelectItem key={weight} value={weight}>
                          {weight}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pieces display for cupcakes */}
              {cake.size.includes("pieces") && (
                <div>
                  <p className="text-sm font-medium mb-1">Quantity</p>
                  <p className="text-muted-foreground">{cake.size}</p>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold border-l border-r border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isFavorited
                      ? "bg-destructive/10 border-destructive text-destructive"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? "fill-current" : ""}`} />
                </button>
              </div>

              <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
