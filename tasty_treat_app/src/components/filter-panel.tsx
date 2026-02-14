"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FilterPanelProps {
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  selectedFlavors: string[]
  setSelectedFlavors: (flavors: string[]) => void
}

const FLAVORS = ["Vanilla", "Chocolate", "Strawberry", "Lemon", "Carrot", "Red Velvet"]

export default function FilterPanel({
  priceRange,
  setPriceRange,
  selectedFlavors,
  setSelectedFlavors,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    flavor: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(
      selectedFlavors.includes(flavor) ? selectedFlavors.filter((f) => f !== flavor) : [...selectedFlavors, flavor],
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-primary">Filters</h2>

      {/* Price Filter */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-4 hover:text-primary transition-colors"
        >
          <h3 className="font-medium">Price Range</h3>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? "" : "-rotate-90"}`} />
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span>Rs. {priceRange[0]}</span>
              <span>Rs. {priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Flavor Filter */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection("flavor")}
          className="flex items-center justify-between w-full mb-4 hover:text-primary transition-colors"
        >
          <h3 className="font-medium">Flavor</h3>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.flavor ? "" : "-rotate-90"}`} />
        </button>
        {expandedSections.flavor && (
          <div className="space-y-3">
            {FLAVORS.map((flavor) => (
              <label key={flavor} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFlavors.includes(flavor)}
                  onChange={() => toggleFlavor(flavor)}
                  className="rounded border-border"
                />
                <span className="text-sm">{flavor}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters */}
      <Button
        onClick={() => {
          setPriceRange([0, 500])
          setSelectedFlavors([])
        }}
        variant="outline"
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  )
}
