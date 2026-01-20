"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FilterPanelProps {
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  selectedFlavors: string[]
  setSelectedFlavors: (flavors: string[]) => void
  selectedDietary: string[]
  setSelectedDietary: (dietary: string[]) => void
  selectedSize: string[]
  setSelectedSize: (size: string[]) => void
}

const FLAVORS = ["Vanilla", "Chocolate", "Strawberry", "Lemon", "Carrot", "Red Velvet"]
const DIETARY_OPTIONS = ["Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free"]
const SIZES = ["4-6 servings", "6-8 servings", "8-10 servings", "10-12 servings"]

export default function FilterPanel({
  priceRange,
  setPriceRange,
  selectedFlavors,
  setSelectedFlavors,
  selectedDietary,
  setSelectedDietary,
  selectedSize,
  setSelectedSize,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    flavor: true,
    dietary: true,
    size: true,
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

  const toggleDietary = (option: string) => {
    setSelectedDietary(
      selectedDietary.includes(option) ? selectedDietary.filter((d) => d !== option) : [...selectedDietary, option],
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSize(selectedSize.includes(size) ? selectedSize.filter((s) => s !== size) : [...selectedSize, size])
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
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
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

      {/* Dietary Filter */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection("dietary")}
          className="flex items-center justify-between w-full mb-4 hover:text-primary transition-colors"
        >
          <h3 className="font-medium">Dietary</h3>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.dietary ? "" : "-rotate-90"}`} />
        </button>
        {expandedSections.dietary && (
          <div className="space-y-3">
            {DIETARY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDietary.includes(option)}
                  onChange={() => toggleDietary(option)}
                  className="rounded border-border"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div className="pb-6">
        <button
          onClick={() => toggleSection("size")}
          className="flex items-center justify-between w-full mb-4 hover:text-primary transition-colors"
        >
          <h3 className="font-medium">Size</h3>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.size ? "" : "-rotate-90"}`} />
        </button>
        {expandedSections.size && (
          <div className="space-y-3">
            {SIZES.map((size) => (
              <label key={size} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSize.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="rounded border-border"
                />
                <span className="text-sm">{size}</span>
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
          setSelectedDietary([])
          setSelectedSize([])
        }}
        variant="outline"
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  )
}
