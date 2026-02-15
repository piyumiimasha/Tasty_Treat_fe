"use client"

import { useState, useMemo, useEffect } from "react"
import CakeGallery from "./cake-gallery"
import FilterPanel from "./filter-panel"
import { getAllItems, getItemsByCategory } from "@/lib/api/items"
import { mapItemToCake, Cake } from "@/lib/mappers/item-mapper"
import { useToast } from "@/hooks/use-toast"

const CAKE_CATEGORIES = ["All Cakes", "Wedding Cakes", "Birthday Cakes", "Cupcakes", "Desserts", "Custom Designs"]

export default function CakeBrowser() {
  const [allCakes, setAllCakes] = useState<Cake[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All Cakes")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const { toast } = useToast()

  // Fetch all cakes on mount
  useEffect(() => {
    loadCakes()
  }, [])

  // Fetch cakes by category when category changes
  useEffect(() => {
    if (selectedCategory !== "All Cakes") {
      loadCakesByCategory(selectedCategory)
    } else {
      loadCakes()
    }
  }, [selectedCategory])

  const loadCakes = async () => {
    try {
      setLoading(true)
      const items = await getAllItems()
      const cakes = items.map(mapItemToCake)
      setAllCakes(cakes)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cakes. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load cakes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCakesByCategory = async (category: string) => {
    try {
      setLoading(true)
      const items = await getItemsByCategory(category)
      const cakes = items.map(mapItemToCake)
      setAllCakes(cakes)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load ${category}. Please try again.`,
        variant: "destructive",
      })
      console.error("Failed to load cakes by category:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter cakes based on price and flavor (category is already filtered by API)
  const filteredCakes = useMemo(() => {
    return allCakes.filter((cake) => {
      const priceMatch = cake.price >= priceRange[0] && cake.price <= priceRange[1]
      const flavorMatch =
        selectedFlavors.length === 0 || selectedFlavors.some((f) => cake.flavor.toLowerCase().includes(f.toLowerCase()))

      return priceMatch && flavorMatch
    })
  }, [allCakes, priceRange, selectedFlavors])

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* Header Section */}
      <div className="w-full px-6 lg:px-12 pt-8 pb-6 border-b border-border">
        <h1 className="text-4xl lg:text-5xl font-serif text-primary mb-3">Tasty Treat</h1>
        <p className="text-muted-foreground text-lg">Handcrafted confections for every occasion</p>
      </div>

      {/* Category Navigation */}
      <div className="w-full px-6 lg:px-12 py-6 border-b border-border">
        <div className="flex flex-wrap gap-3">
          {CAKE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category)
              }}
              className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Gallery Container */}
      <div className="flex flex-col lg:flex-row flex-1 w-full">
        <aside className="w-full lg:w-72 px-6 lg:px-12 py-6 lg:border-r border-border bg-muted/30">
          <FilterPanel
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedFlavors={selectedFlavors}
            setSelectedFlavors={setSelectedFlavors}
          />
        </aside>

        {/* Gallery Section */}
        <div className="flex-1 px-6 lg:px-12 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading cakes...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredCakes.length} of {allCakes.length} cakes
                </p>
              </div>
              <CakeGallery cakes={filteredCakes} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
