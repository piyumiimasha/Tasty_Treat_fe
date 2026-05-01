"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import CakeGallery from "./cake-gallery"
import FilterPanel from "./filter-panel"
import { getAllItems, getItemsByCategory } from "@/lib/api/items"
import { mapItemToCake, Cake } from "@/lib/mappers/item-mapper"
import { useToast } from "@/hooks/use-toast"
import { Search, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const HERO_SLIDES = [
  { image: "/elegant-white-wedding-cake.jpg",       tag: "Wedding Collection", caption: "Timeless elegance for your most special day"    },
  { image: "/decadent-chocolate-cake.png",           tag: "Birthday Cakes",     caption: "Rich, indulgent cakes worth celebrating"         },
  { image: "/fresh-strawberry-shortcake-cream.jpg", tag: "Fresh Creations",    caption: "Crafted with the finest seasonal ingredients"    },
  { image: "/galaxy-cake.jpg",                       tag: "Custom Designs",     caption: "One-of-a-kind creations, uniquely yours"         },
]

export default function CakeBrowser() {
  const [allCakes, setAllCakes]                 = useState<Cake[]>([])
  const [loading, setLoading]                   = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All Cakes")
  const [priceRange, setPriceRange]             = useState<[number, number]>([0, 500])
  const [selectedFlavors, setSelectedFlavors]   = useState<string[]>([])
  const [searchQuery, setSearchQuery]           = useState("")
  const [activeSlide, setActiveSlide]           = useState(0)
  const [filterOpen, setFilterOpen]             = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { toast }   = useToast()

  /* ── hero auto-advance ── */
  useEffect(() => {
    intervalRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % HERO_SLIDES.length), 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const goToSlide = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setActiveSlide(idx)
    intervalRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % HERO_SLIDES.length), 3000)
  }

  /* ── listen for events from the nav bar ── */
  useEffect(() => {
    const onSearch = (e: Event) => setSearchQuery((e as CustomEvent<string>).detail)
    const onOpen   = () => setFilterOpen(true)
    window.addEventListener("cake-search", onSearch)
    window.addEventListener("open-filters", onOpen)
    return () => {
      window.removeEventListener("cake-search", onSearch)
      window.removeEventListener("open-filters", onOpen)
    }
  }, [])

  /* ── data fetching ── */
  useEffect(() => { loadCakes() }, [])
  useEffect(() => {
    selectedCategory !== "All Cakes" ? loadCakesByCategory(selectedCategory) : loadCakes()
  }, [selectedCategory])

  const loadCakes = async () => {
    try { setLoading(true); setAllCakes((await getAllItems()).map(mapItemToCake)) }
    catch { toast({ title: "Error", description: "Failed to load cakes.", variant: "destructive" }) }
    finally { setLoading(false) }
  }

  const loadCakesByCategory = async (cat: string) => {
    try { setLoading(true); setAllCakes((await getItemsByCategory(cat)).map(mapItemToCake)) }
    catch { toast({ title: "Error", description: `Failed to load ${cat}.`, variant: "destructive" }) }
    finally { setLoading(false) }
  }

  /* ── filtering ── */
  const filteredCakes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allCakes.filter((cake) => {
      const priceMatch  = cake.price >= priceRange[0] && cake.price <= priceRange[1]
      const flavorMatch = !selectedFlavors.length ||
        selectedFlavors.some((f) => cake.flavor.toLowerCase().includes(f.toLowerCase()))
      const searchMatch = !q ||
        cake.name.toLowerCase().includes(q) ||
        cake.category.toLowerCase().includes(q) ||
        cake.flavor.toLowerCase().includes(q)
      return priceMatch && flavorMatch && searchMatch
    })
  }, [allCakes, priceRange, selectedFlavors, searchQuery])

  const activeFilterCount =
    selectedFlavors.length +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (selectedCategory !== "All Cakes" ? 1 : 0)

  /* broadcast filter count to nav badge */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("filter-count", { detail: activeFilterCount }))
  }, [activeFilterCount])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setFilterOpen(false)
  }

  const clearAll = () => {
    setPriceRange([0, 500])
    setSelectedFlavors([])
    setSelectedCategory("All Cakes")
    setSearchQuery("")
    window.dispatchEvent(new CustomEvent("cake-search", { detail: "" }))
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">

      {/* ═══════════════════════════════════
          Hero — fills viewport
      ═══════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>

        {/* slides */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === activeSlide ? 1 : 0 }}
          >
            <img src={slide.image} alt={slide.tag} className="w-full h-full object-cover" />
          </div>
        ))}

        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/28 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-transparent to-transparent" />

        {/* headline */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full max-w-7xl mx-auto px-8 lg:px-14">
            <div className="max-w-lg">
              <p
                key={`tag-${activeSlide}`}
                className="text-white/70 text-xs font-semibold tracking-[0.22em] uppercase mb-4 animate-fade-in-up"
              >
                {HERO_SLIDES[activeSlide].tag}
              </p>
              <h1
                key={`h1-${activeSlide}`}
                className="font-serif text-5xl lg:text-[3.6rem] font-bold text-white leading-[1.1] mb-4 animate-fade-in-up"
                style={{ animationDelay: "55ms" }}
              >
                Every Cake Tells<br />
                <em className="not-italic" style={{ color: "oklch(0.87 0.07 18)" }}>a Story</em>
              </h1>
              <p
                key={`cap-${activeSlide}`}
                className="text-white/65 text-base lg:text-lg leading-relaxed animate-fade-in-up"
                style={{ animationDelay: "110ms" }}
              >
                {HERO_SLIDES[activeSlide].caption}
              </p>
            </div>
          </div>
        </div>

        {/* slide dots only — no counter */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === activeSlide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/35 hover:bg-white/65"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════
          Filters / results bar
      ═══════════════════════════════════ */}
      <div className="w-full bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3.5 flex flex-wrap items-center gap-3">

          {/* active chips */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {searchQuery && (
              <span className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
                &ldquo;{searchQuery}&rdquo;
                <button
                  onClick={() => {
                    setSearchQuery("")
                    window.dispatchEvent(new CustomEvent("cake-search", { detail: "" }))
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "All Cakes" && (
              <span className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-1 rounded-full font-medium border border-border">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("All Cakes")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedFlavors.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs bg-secondary text-foreground px-3 py-1 rounded-full font-medium border border-border">
                {f}
                <button onClick={() => setSelectedFlavors(selectedFlavors.filter((x) => x !== f))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(activeFilterCount > 0 || searchQuery) && (
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-accent transition-colors font-medium">
                Clear all
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-semibold text-foreground">{filteredCakes.length}</span> cake{filteredCakes.length !== 1 ? "s" : ""}
          </p>

          {/* Sheet — opened via nav button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 flex flex-col bg-background border-l border-border/60">
              <SheetHeader className="px-6 py-5 border-b border-border/60 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-serif text-xl font-bold text-primary">Refine Results</SheetTitle>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setPriceRange([0, 500]); setSelectedFlavors([]); setSelectedCategory("All Cakes") }}
                      className="text-xs text-accent hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                  </p>
                )}
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <FilterPanel
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedFlavors={selectedFlavors}
                  setSelectedFlavors={setSelectedFlavors}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={handleCategoryChange}
                />
              </div>

              <div className="px-6 py-4 border-t border-border/60 flex-shrink-0">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full h-11 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20"
                >
                  Show {filteredCakes.length} result{filteredCakes.length !== 1 ? "s" : ""}
                </button>
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>

      {/* ═══════════════════════════════════
          Gallery
      ═══════════════════════════════════ */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm">Loading our cakes for you…</p>
          </div>
        ) : filteredCakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-primary mb-2">No cakes found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your search or filters to discover more of our creations.
            </p>
            <button onClick={clearAll} className="mt-5 text-sm text-accent font-medium hover:underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <CakeGallery cakes={filteredCakes} />
        )}
      </div>
    </div>
  )
}
