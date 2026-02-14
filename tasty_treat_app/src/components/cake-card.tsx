"use client"
import { Star, Heart } from "lucide-react"
import { useState } from "react"

interface Cake {
  id: number
  name: string
  category: string
  price: number
  size: string
  flavor: string
  dietary: string[]
  rating: number
  images: string[]
  videos: string[]
}

interface CakeCardProps {
  cake: Cake
  onClick: () => void
}

export default function CakeCard({ cake, onClick }: CakeCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image Container */}
      <div className="relative h-80 bg-muted overflow-hidden">
        <img
          src={cake.images[0] || "/placeholder.svg"}
          alt={cake.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorited(!isFavorited)
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors backdrop-blur-sm"
        >
          <Heart className={`w-5 h-5 ${isFavorited ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          {cake.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-primary text-lg mb-1 line-clamp-2">{cake.name}</h3>

        <div className="flex items-center mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.floor(cake.rating) ? "fill-accent text-accent" : "text-muted"}`}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-3">{cake.flavor}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">{cake.size}</p>
            <p className="text-lg font-bold text-primary">Rs. {cake.price}</p>
          </div>
          <button className="px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-sm font-medium">
            View
          </button>
        </div>
      </div>
    </div>
  )
}
