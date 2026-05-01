"use client"

import { X, ChevronLeft, ChevronRight, Heart, ShoppingCart, Star } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cake } from "@/lib/mappers/item-mapper"
import { ItemFlavourDto, getFlavoursByItem } from "@/lib/api/item-flavours"


function parseKg(weightStr: string): number {
  const num = parseFloat(weightStr)
  return isNaN(num) ? 1 : num
}

interface CakeModalProps {
  cake: Cake
  onClose: () => void
}

export default function CakeModal({ cake, onClose }: CakeModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(cake.size)
  const [flavours, setFlavours] = useState<ItemFlavourDto[]>([])
  const [selectedFlavourId, setSelectedFlavourId] = useState<string>("base")

  useEffect(() => {
    getFlavoursByItem(cake.id).then((data) => {
      setFlavours(data)
    }).catch(() => {
      setFlavours([])
    })
  }, [cake.id])

  const selectedFlavour = selectedFlavourId === "base"
    ? null
    : flavours.find((f) => String(f.itemFlavourId) === selectedFlavourId)

  const calculatedPrice = useMemo(() => {
    const baseWeight = parseKg(cake.size)
    const chosenWeight = parseKg(selectedWeight)
    const weightPrice = baseWeight > 0 ? (cake.price / baseWeight) * chosenWeight : cake.price
    const flavourExtra = selectedFlavour ? selectedFlavour.extraPrice : 0
    return Math.round((weightPrice + flavourExtra) * 100) / 100
  }, [cake.price, cake.size, selectedWeight, selectedFlavour])

  const totalPrice = Math.round(calculatedPrice * quantity * 100) / 100

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % cake.images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + cake.images.length) % cake.images.length)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-background rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-border/40 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-sm border-b border-border/60">
          <div>
            <span className="text-xs font-medium text-accent uppercase tracking-wider">{cake.category}</span>
            <h2 className="font-serif text-2xl font-bold text-primary leading-tight">{cake.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-88 rounded-xl overflow-hidden bg-muted group" style={{ height: "22rem" }}>
              <img
                src={cake.images[currentImageIndex] || "/placeholder.svg"}
                alt={`${cake.name} view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
              />

              {cake.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {cake.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`rounded-full transition-all ${
                      idx === currentImageIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/60 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>
            </div>

            {cake.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cake.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? "border-accent shadow-md shadow-accent/20"
                        : "border-border hover:border-muted-foreground"
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
          <div className="space-y-5">
            {/* Price & Rating */}
            <div>
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(cake.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">({cake.rating} / 5)</span>
              </div>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-bold text-primary font-serif">Rs. {calculatedPrice.toLocaleString()}</h3>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Base: Rs. {cake.price.toLocaleString()} / {cake.size}
                {selectedFlavour && selectedFlavour.extraPrice > 0
                  ? <span className="ml-2 text-accent">+Rs. {selectedFlavour.extraPrice} ({selectedFlavour.name})</span>
                  : selectedFlavourId === "base" && <span className="ml-2">· {cake.flavor}</span>
                }
              </p>
            </div>

            {/* Flavor & Weight */}
            <div className="space-y-3 pb-5 border-b border-border/60">
              {cake.flavor && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Flavor</label>
                  <Select value={selectedFlavourId} onValueChange={setSelectedFlavourId}>
                    <SelectTrigger className="w-full rounded-xl border-border/70 bg-secondary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="base">{cake.flavor}</SelectItem>
                      {flavours.map((f) => (
                        <SelectItem key={f.itemFlavourId} value={String(f.itemFlavourId)}>
                          {f.name}{f.extraPrice > 0 ? ` (+Rs. ${f.extraPrice})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {cake.category !== "Cupcakes" ? (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Weight</label>
                  <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                    <SelectTrigger className="w-full rounded-xl border-border/70 bg-secondary/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[cake.size, ...["0.5 kg", "1 kg", "1.5 kg", "2 kg", "2.5 kg", "3 kg"].filter((w) => w !== cake.size)].map((weight) => (
                        <SelectItem key={weight} value={weight}>{weight}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Quantity</p>
                  <p className="text-muted-foreground text-sm">{cake.size}</p>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-border/70 overflow-hidden bg-secondary/30">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 hover:bg-muted transition-colors text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="px-5 py-2.5 font-bold text-foreground border-l border-r border-border/60 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2.5 hover:bg-muted transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-2.5 rounded-xl border-2 transition-all ${
                    isFavorited
                      ? "bg-rose-50 border-rose-300 text-rose-500"
                      : "border-border hover:border-rose-300 hover:text-rose-400 text-muted-foreground"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                </button>
              </div>

              <button className="w-full py-3.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-accent/25">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart — Rs. {totalPrice.toLocaleString()}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-border rounded-xl font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
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
