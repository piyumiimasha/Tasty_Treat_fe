"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import CakeGallery from "./cake-gallery"
import FilterPanel from "./filter-panel"
import { getAllItems, getItemsByCategory } from "@/lib/api/items"
import { getCategories } from "@/lib/api/categories"
import { getDistinctFlavours } from "@/lib/api/item-flavours"
import { mapItemToCake, Cake } from "@/lib/mappers/item-mapper"
import { useToast } from "@/hooks/use-toast"
import { Search, X, ArrowRight } from "lucide-react"
import HeroIllustration from "./hero-illustration"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"


export default function CakeBrowser() {
  const [allCakes, setAllCakes]                 = useState<Cake[]>([])
  const [dbCategories, setDbCategories]         = useState<string[]>([])
  const [dbFlavours, setDbFlavours]             = useState<string[]>([])
  const [loading, setLoading]                   = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All Cakes")
  const [priceRange, setPriceRange]             = useState<[number, number]>([0, 10000])
  const [selectedFlavors, setSelectedFlavors]   = useState<string[]>([])
  const [searchQuery, setSearchQuery]           = useState("")
  const [filterOpen, setFilterOpen]             = useState(false)
  const galleryRef    = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const { toast }     = useToast()

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
  useEffect(() => {
    getCategories().then((cats) => setDbCategories(cats.map((c) => c.name))).catch(() => {})
    getDistinctFlavours().then(setDbFlavours).catch(() => {})
    loadCakes()
  }, [])
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
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) +
    (selectedCategory !== "All Cakes" ? 1 : 0)

  /* broadcast filter count to nav badge */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("filter-count", { detail: activeFilterCount }))
  }, [activeFilterCount])

  /* scroll to gallery when search or filters change (skip initial mount) */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [searchQuery, selectedFlavors, priceRange, selectedCategory])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setFilterOpen(false)
  }

  const clearAll = () => {
    setPriceRange([0, 10000])
    setSelectedFlavors([])
    setSelectedCategory("All Cakes")
    setSearchQuery("")
    window.dispatchEvent(new CustomEvent("cake-search", { detail: "" }))
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">

      {/* ═══════════════════════════════════
          Hero — split layout
      ═══════════════════════════════════ */}
      <div
        className="relative w-full bg-background overflow-hidden"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {/* Ambient light blobs */}
        <div className="absolute -top-32 right-0 w-[560px] h-[560px] rounded-full bg-accent/5 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[320px] rounded-full bg-primary/4 blur-[70px] pointer-events-none" />

        <div
          className="relative max-w-7xl mx-auto px-8 lg:px-14 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-14 lg:py-0"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          {/* ── Left — copy ── */}
          <div className="flex-1 flex flex-col justify-center order-2 lg:order-1">
            <div className="hero-line mb-7" />

            <div className="overflow-hidden mb-5">
              <p className="word-up text-[11px] font-semibold tracking-[0.28em] uppercase text-accent" style={{ animationDelay: "150ms" }}>
                Artisan Patisserie
              </p>
            </div>

            <h1 className="font-serif text-[3.4rem] sm:text-[4.4rem] lg:text-[5rem] xl:text-[5.8rem] font-bold text-primary leading-[0.92] mb-7">
              <span className="block">
                {["Every", "Cake"].map((word, i) => (
                  <span key={word} className="inline-block" style={{ overflow: "hidden", marginRight: "0.22em", paddingBottom: "0.2em", marginBottom: "-0.2em" }}>
                    <span className="word-up" style={{ animationDelay: `${200 + i * 90}ms` }}>{word}</span>
                  </span>
                ))}
              </span>
              <span className="block">
                {["Tells", "a"].map((word, i) => (
                  <span key={word} className="inline-block" style={{ overflow: "hidden", marginRight: "0.22em", paddingBottom: "0.2em", marginBottom: "-0.2em" }}>
                    <span className="word-up" style={{ animationDelay: `${380 + i * 90}ms` }}>{word}</span>
                  </span>
                ))}
              </span>
              <span className="block" style={{ overflow: "hidden", paddingBottom: "0.2em", marginBottom: "-0.2em" }}>
                <em className="word-up not-italic inline-block" style={{ color: "var(--accent)", animationDelay: "560ms" }}>Story</em>
              </span>
            </h1>

            <p className="hero-fade text-muted-foreground text-base lg:text-lg leading-relaxed mb-9 max-w-[380px]" style={{ animationDelay: "720ms" }}>
              Handcrafted with the finest ingredients, designed to make every celebration truly unforgettable.
            </p>

            <div className="hero-fade flex items-center gap-5 mb-12" style={{ animationDelay: "860ms" }}>
              <button
                onClick={() => galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="group flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/85 transition-all duration-300 shadow-md shadow-primary/15"
              >
                Explore Cakes
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <a
                href="/customize"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline transition-all"
              >
                Customize Yours →
              </a>
            </div>

          </div>

          {/* ── Right — animated illustration ── */}
          <div className="flex-1 flex items-center justify-center order-1 lg:order-2 w-full">
            <div
              className="relative w-full"
              style={{ height: "clamp(320px, 54vw, 680px)", maxWidth: "560px" }}
            >
              <HeroIllustration />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          Gallery — seamless section
      ═══════════════════════════════════ */}
      <div ref={galleryRef} className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-12">

          {/* Section header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-px bg-accent" />
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-accent">Our Collection</span>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary leading-none">Browse Our Cakes</h2>
              <p className="text-sm text-muted-foreground pb-1">
                <span className="font-semibold text-foreground">{filteredCakes.length}</span> cake{filteredCakes.length !== 1 ? "s" : ""}
              </p>
            </div>
            {(activeFilterCount > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {searchQuery && (
                  <span className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
                    &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => { setSearchQuery(""); window.dispatchEvent(new CustomEvent("cake-search", { detail: "" })) }}>
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
                    <button onClick={() => setSelectedFlavors(selectedFlavors.filter((x) => x !== f))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-accent transition-colors font-medium">Clear all</button>
              </div>
            )}
          </div>

          {/* Content */}
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

        {/* Filter sheet — triggered by nav event, no visible button needed here */}
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 flex flex-col bg-background border-l border-border/60">
            <SheetHeader className="px-6 py-5 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-serif text-xl font-bold text-primary">Refine Results</SheetTitle>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setPriceRange([0, 10000]); setSelectedFlavors([]); setSelectedCategory("All Cakes") }}
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
                categories={dbCategories}
                flavours={dbFlavours}
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
  )
}
