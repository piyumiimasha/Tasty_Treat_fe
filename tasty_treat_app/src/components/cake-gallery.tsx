"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import CakeCard from "./cake-card"
import CakeModal from "./cake-modal"
import { getItemById } from "@/lib/api/items"
import { mapItemToCake, Cake } from "@/lib/mappers/item-mapper"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 4

interface CakeGalleryProps {
  cakes: Cake[]
}

export default function CakeGallery({ cakes }: CakeGalleryProps) {
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null)
  const [loadingCake, setLoadingCake]   = useState(false)
  const [page, setPage]                 = useState(0)
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([])
  const { toast } = useToast()

  const totalPages = Math.ceil(cakes.length / PAGE_SIZE)
  const visibleCakes = cakes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  // Reset to first page when the cake list changes (filter/search)
  useEffect(() => { setPage(0) }, [cakes])

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, visibleCakes.length)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    cardRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [visibleCakes])

  const handleCakeClick = async (cake: Cake) => {
    try {
      setLoadingCake(true)
      const item = await getItemById(cake.id)
      setSelectedCake(mapItemToCake(item))
    } catch {
      toast({ title: "Error", description: "Failed to load cake details. Please try again.", variant: "destructive" })
    } finally {
      setLoadingCake(false)
    }
  }

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const next = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages])

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
      <div className="relative">
        {/* Left arrow */}
        {page > 0 && (
          <button
            onClick={prev}
            aria-label="Previous cakes"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-primary hover:bg-accent hover:text-white hover:border-accent transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right arrow */}
        {page < totalPages - 1 && (
          <button
            onClick={next}
            aria-label="Next cakes"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-primary hover:bg-accent hover:text-white hover:border-accent transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Grid — always 4 columns, always one row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {visibleCakes.map((cake, idx) => (
            <div
              key={cake.id}
              ref={(el) => { cardRefs.current[idx] = el }}
              className="card-reveal"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <CakeCard cake={cake} onClick={() => handleCakeClick(cake)} />
            </div>
          ))}
        </div>

        {/* Page dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                className="transition-all duration-200"
                style={{
                  width: i === page ? "20px" : "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: i === page ? "var(--accent)" : "var(--border)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {loadingCake && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      {selectedCake && <CakeModal cake={selectedCake} onClose={() => setSelectedCake(null)} />}
    </>
  )
}
