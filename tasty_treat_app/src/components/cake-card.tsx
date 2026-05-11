"use client"

import { Heart, Eye } from "lucide-react"
import { useState } from "react"
import { Cake } from "@/lib/mappers/item-mapper"

interface CakeCardProps {
  cake: Cake
  onClick: () => void
}

export default function CakeCard({ cake, onClick }: CakeCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-72 bg-muted overflow-hidden">
        <img
          src={cake.images[0] || "/placeholder.svg"}
          alt={cake.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          style={{ transform: undefined }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg"
          }}
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorited(!isFavorited)
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm backdrop-blur-sm transition-all hover:scale-110"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 text-primary text-xs font-semibold rounded-full backdrop-blur-sm shadow-sm">
          {cake.category}
        </div>

        {/* Quick view on hover */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-primary text-sm font-medium shadow-lg">
            <Eye className="w-4 h-4" />
            Quick View
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif font-semibold text-foreground text-lg mb-1.5 line-clamp-1 group-hover:text-accent transition-colors">
          {cake.name}
        </h3>


        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{cake.flavor}</p>

        {/* Footer */}
        <div className="pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground mb-0.5">
            {cake.category === "Cupcakes" ? cake.size : `Weight: ${cake.size}`}
          </p>
          <p className="text-xl font-bold text-primary">
            Rs. {cake.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
