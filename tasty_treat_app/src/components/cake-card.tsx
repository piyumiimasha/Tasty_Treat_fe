"use client"

import { Cake } from "@/lib/mappers/item-mapper"

interface CakeCardProps {
  cake: Cake
  onClick: () => void
}

export default function CakeCard({ cake, onClick }: CakeCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden bg-muted aspect-[3/4] rounded-2xl"
    >
      {/* Full-bleed image */}
      <img
        src={cake.images[0] || "/placeholder.svg"}
        alt={cake.name}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
      />

      {/* Edge blend — top and bottom fade into page background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, var(--background) 0%, transparent 22%, transparent 72%, var(--background) 100%)",
          opacity: 0.35,
        }}
      />

      {/* Hover — dark veil sits above the blend layer */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-500" />

      {/* Hover — name slides up from bottom */}
      <div className="absolute inset-x-0 bottom-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
        <p className="font-serif text-white text-xl font-semibold leading-tight drop-shadow-md">
          {cake.name}
        </p>
        <p className="text-white/65 text-xs mt-1 tracking-wide uppercase">{cake.category}</p>
      </div>
    </div>
  )
}
