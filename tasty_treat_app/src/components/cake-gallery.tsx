"use client"

import { useState } from "react"
import CakeCard from "./cake-card"
import CakeModal from "./cake-modal"

interface Cake {
  id: number
  name: string
  category: string
  price: number
  size: string
  flavor: string
  rating: number
  images: string[]
  videos: string[]
}

interface CakeGalleryProps {
  cakes: Cake[]
}

export default function CakeGallery({ cakes }: CakeGalleryProps) {
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null)

  if (cakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-semibold text-primary mb-2">No Cakes Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more options</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cakes.map((cake) => (
          <CakeCard key={cake.id} cake={cake} onClick={() => setSelectedCake(cake)} />
        ))}
      </div>

      {selectedCake && <CakeModal cake={selectedCake} onClose={() => setSelectedCake(null)} />}
    </>
  )
}
