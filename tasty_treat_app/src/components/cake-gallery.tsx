"use client"

import { useState } from "react"
import CakeCard from "./cake-card"
import CakeModal from "./cake-modal"
import { getItemById } from "@/lib/api/items"
import { mapItemToCake, Cake } from "@/lib/mappers/item-mapper"
import { useToast } from "@/hooks/use-toast"

interface CakeGalleryProps {
  cakes: Cake[]
}

export default function CakeGallery({ cakes }: CakeGalleryProps) {
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null)
  const [loadingCake, setLoadingCake] = useState(false)
  const { toast } = useToast()

  const handleCakeClick = async (cake: Cake) => {
    try {
      setLoadingCake(true)
      // Fetch fresh data from backend
      const item = await getItemById(cake.id)
      const fullCakeData = mapItemToCake(item)
      setSelectedCake(fullCakeData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cake details. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load cake details:", error)
    } finally {
      setLoadingCake(false)
    }
  }

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
          <CakeCard key={cake.id} cake={cake} onClick={() => handleCakeClick(cake)} />
        ))}
      </div>

      {loadingCake && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {selectedCake && <CakeModal cake={selectedCake} onClose={() => setSelectedCake(null)} />}
    </>
  )
}
