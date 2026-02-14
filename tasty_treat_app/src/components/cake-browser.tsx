"use client"

import { useState, useMemo } from "react"
import CakeGallery from "./cake-gallery"
import FilterPanel from "./filter-panel"

const CAKE_CATEGORIES = ["All Cakes", "Wedding Cakes", "Birthday Cakes", "Cupcakes", "Desserts", "Custom Designs"]

const CAKES_DATA = [
  {
    id: 1,
    name: "Classic Wedding Elegance",
    category: "Wedding Cakes",
    price: 250,
    size: "2 kg",
    flavor: "Vanilla Bean & Champagne",
    dietary: ["vegan"],
    rating: 4.9,
    images: ["/elegant-white-wedding-cake.jpg", "/wedding-cake-side-view.jpg"],
    videos: [],
  },
  {
    id: 2,
    name: "Rainbow Birthday Delight",
    category: "Birthday Cakes",
    price: 85,
    size: "1 kg",
    flavor: "Chocolate & Strawberry",
    dietary: ["gluten-free"],
    rating: 4.8,
    images: ["/colorful-rainbow-birthday-cake.jpg", "/birthday-cake-top-view.jpg"],
    videos: [],
  },
  {
    id: 3,
    name: "Velvet Cupcake Set",
    category: "Cupcakes",
    price: 35,
    size: "12 pieces",
    flavor: "Red Velvet",
    dietary: ["vegan", "gluten-free"],
    rating: 4.7,
    images: ["/red-velvet-cupcakes-with-cream-frosting.jpg", "/cupcake-arrangement.jpg"],
    videos: [],
  },
  {
    id: 4,
    name: "Decadent Chocolate Torte",
    category: "Desserts",
    price: 45,
    size: "1 kg",
    flavor: "Dark Chocolate",
    dietary: [],
    rating: 4.9,
    images: ["/rich-dark-chocolate-cake-layers.jpg", "/chocolate-torte-cross-section.jpg"],
    videos: [],
  },
  {
    id: 5,
    name: "Modern Geometric Wedding",
    category: "Wedding Cakes",
    price: 320,
    size: "2 kg",
    flavor: "Lemon & Lavender",
    dietary: ["vegan"],
    rating: 4.6,
    images: ["/modern-geometric-wedding-cake-design.jpg", "/geometric-cake-detail.jpg"],
    videos: [],
  },
  {
    id: 6,
    name: "Salted Caramel Cupcakes",
    category: "Cupcakes",
    price: 40,
    size: "12 pieces",
    flavor: "Salted Caramel",
    dietary: ["gluten-free"],
    rating: 4.8,
    images: ["/salted-caramel-cupcakes-gourmet.jpg", "/caramel-cupcake-close-up.jpg"],
    videos: [],
  },
  {
    id: 7,
    name: "Strawberry Shortcake",
    category: "Desserts",
    price: 55,
    size: "1 kg",
    flavor: "Strawberry & Cream",
    dietary: ["vegan"],
    rating: 4.9,
    images: ["/fresh-strawberry-shortcake-cream.jpg", "/strawberry-cake-layers.jpg"],
    videos: [],
  },
  {
    id: 8,
    name: "Custom Anniversary Cake",
    category: "Custom Designs",
    price: 200,
    size: "1.5 kg",
    flavor: "Personalized",
    dietary: ["vegan", "gluten-free"],
    rating: 5.0,
    images: ["/custom-anniversary-cake-design.jpg", "/personalized-cake-decoration.jpg"],
    videos: [],
  },
]

export default function CakeBrowser() {
  const [selectedCategory, setSelectedCategory] = useState("All Cakes")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])

  // Filter cakes based on all criteria
  const filteredCakes = useMemo(() => {
    return CAKES_DATA.filter((cake) => {
      const categoryMatch = selectedCategory === "All Cakes" || cake.category === selectedCategory
      const priceMatch = cake.price >= priceRange[0] && cake.price <= priceRange[1]
      const flavorMatch =
        selectedFlavors.length === 0 || selectedFlavors.some((f) => cake.flavor.toLowerCase().includes(f.toLowerCase()))

      return categoryMatch && priceMatch && flavorMatch
    })
  }, [selectedCategory, priceRange, selectedFlavors])

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
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCakes.length} of {CAKES_DATA.length} cakes
            </p>
          </div>
          <CakeGallery cakes={filteredCakes} />
        </div>
      </div>
    </div>
  )
}
