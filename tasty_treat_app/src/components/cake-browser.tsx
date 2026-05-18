"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import CakeGallery from "./cake-gallery"
import CakeModal from "./cake-modal"
import SignatureCakes from "./signature-cakes"
import FilterPanel from "./filter-panel"
import { getAllItems, getItemsByCategory } from "@/lib/api/items"
import { getItemById } from "@/lib/api/items"
import { getCategories } from "@/lib/api/categories"
import { getDistinctFlavours } from "@/lib/api/item-flavours"
import { mapItemToCake, Cake } from "@/lib/mappers/item-mapper"
import { useToast } from "@/hooks/use-toast"
import { Search, X, ArrowRight } from "lucide-react"
import HeroIllustration from "./hero-illustration"
import CustomerReviews from "./customer-reviews"
import Footer from "./footer"
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
  const [selectedCake, setSelectedCake]         = useState<Cake | null>(null)
  const [loadingCake, setLoadingCake]           = useState(false)
  const galleryRef    = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const { toast }     = useToast()

  const SIGNATURE_NAMES = ["butter cake", "chocolate cake"]

  const isSignature = (cake: Cake) =>
    SIGNATURE_NAMES.some((n) => cake.name.toLowerCase().includes(n))

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

  const signatureCakes = useMemo(
    () => filteredCakes.filter(isSignature),
    [filteredCakes]
  )
  const otherCakes = useMemo(
    () => filteredCakes.filter((c) => !isSignature(c)),
    [filteredCakes]
  )

  const handleCakeSelect = async (cake: Cake) => {
    try {
      setLoadingCake(true)
      const item = await getItemById(cake.id)
      setSelectedCake(mapItemToCake(item))
    } catch {
      toast({ title: "Error", description: "Failed to load cake details.", variant: "destructive" })
    } finally {
      setLoadingCake(false)
    }
  }

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

        {/* ── Floating cake slices ── */}
        <style>{`
          @keyframes cs1 { 0%,100%{transform:translate(0,0) rotate(-12deg);} 50%{transform:translate(7px,-22px) rotate(4deg);} }
          @keyframes cs2 { 0%,100%{transform:translate(0,0) rotate(8deg);} 50%{transform:translate(-8px,-18px) rotate(-6deg);} }
          @keyframes cs3 { 0%,100%{transform:translate(0,0) rotate(15deg);} 40%{transform:translate(6px,-26px) rotate(-4deg);} 80%{transform:translate(-5px,-14px) rotate(12deg);} }
          @keyframes cs4 { 0%,100%{transform:translate(0,0) rotate(-6deg);} 50%{transform:translate(-6px,-20px) rotate(9deg);} }
          @keyframes cs5 { 0%,100%{transform:translate(0,0) rotate(20deg);} 50%{transform:translate(9px,-16px) rotate(4deg);} }
          @keyframes cs6 { 0%,100%{transform:translate(0,0) rotate(-18deg);} 50%{transform:translate(-4px,-24px) rotate(-2deg);} }
        `}</style>

        {/* Slice 1 — butter cake, top-left */}
        <div className="absolute pointer-events-none" style={{ top: "9%", left: "1.5%", opacity: 0.72, animation: "cs1 6.1s ease-in-out infinite 0.4s" }}>
          <svg viewBox="0 0 52 58" width="52" height="58" fill="none">
            <ellipse cx="26" cy="55" rx="17" ry="4" fill="#00000010"/>
            <path d="M26 7 L4 50 L48 50 Z" fill="#F5DFA0"/>
            <path d="M14 36 L38 36 L46 50 L6 50 Z" fill="#F5DFA0"/>
            <path d="M14 36 L38 36 L36 28 L16 28 Z" fill="#ECC0D0" opacity="0.85"/>
            <path d="M16 28 L36 28 L26 7 Z" fill="#F5DFA0"/>
            <ellipse cx="26" cy="27" rx="11" ry="5" fill="white" opacity="0.88"/>
            <path d="M21 17 Q26 8 31 17 Q35 23 26 25 Q17 23 21 17Z" fill="white" opacity="0.95"/>
            <circle cx="26" cy="6" r="5" fill="#CC2030"/>
            <rect x="25" y="1" width="2" height="6" rx="1" fill="#5A9A20"/>
          </svg>
        </div>

        {/* Slice 2 — chocolate, bottom-left */}
        <div className="absolute pointer-events-none" style={{ top: "68%", left: "2.5%", opacity: 0.65, animation: "cs2 5.4s ease-in-out infinite 1.6s" }}>
          <svg viewBox="0 0 48 54" width="46" height="52" fill="none">
            <ellipse cx="24" cy="51" rx="16" ry="4" fill="#00000012"/>
            <path d="M24 7 L3 47 L45 47 Z" fill="#3D1A08"/>
            <path d="M13 33 L35 33 L43 47 L5 47 Z" fill="#3D1A08"/>
            <path d="M13 33 L35 33 L33 25 L15 25 Z" fill="#5C2510" opacity="0.9"/>
            <path d="M15 25 L33 25 L24 7 Z" fill="#3D1A08"/>
            <ellipse cx="24" cy="24" rx="10" ry="4" fill="#F5F0E8" opacity="0.85"/>
            <path d="M20 16 Q24 8 28 16 Q31 22 24 24 Q17 22 20 16Z" fill="white" opacity="0.9"/>
            <ellipse cx="17" cy="42" rx="5" ry="3" fill="#E03050" opacity="0.9"/>
            <ellipse cx="27" cy="40" rx="4" ry="3" fill="#E03050" opacity="0.8"/>
          </svg>
        </div>

        {/* Slice 3 — strawberry pink, mid-left */}
        <div className="absolute pointer-events-none" style={{ top: "38%", left: "0.5%", opacity: 0.6, animation: "cs3 7s ease-in-out infinite 0.9s" }}>
          <svg viewBox="0 0 44 50" width="40" height="46" fill="none">
            <ellipse cx="22" cy="47" rx="14" ry="3.5" fill="#00000010"/>
            <path d="M22 6 L3 44 L41 44 Z" fill="#F5E0E8"/>
            <path d="M12 31 L32 31 L39 44 L5 44 Z" fill="#F5E0E8"/>
            <path d="M12 31 L32 31 L30 23 L14 23 Z" fill="#ECC0D0" opacity="0.9"/>
            <path d="M14 23 L30 23 L22 6 Z" fill="#F5E0E8"/>
            <ellipse cx="22" cy="22" rx="9" ry="4" fill="white" opacity="0.9"/>
            <path d="M18 14 Q22 7 26 14 Q29 20 22 22 Q15 20 18 14Z" fill="white"/>
            {[13,20,28].map((x,i)=><circle key={i} cx={x} cy={37+(i%2)*3} r="3" fill="#CC2040" opacity="0.85"/>)}
            {[13,20,28].map((x,i)=><circle key={i} cx={x} cy={37+(i%2)*3} r="1.2" fill="#FFD0D0"/>)}
          </svg>
        </div>

        {/* Slice 4 — vanilla, upper-center */}
        <div className="absolute pointer-events-none" style={{ top: "5%", left: "28%", opacity: 0.6, animation: "cs4 5.8s ease-in-out infinite 2.1s" }}>
          <svg viewBox="0 0 44 50" width="38" height="44" fill="none">
            <ellipse cx="22" cy="47" rx="14" ry="3.5" fill="#00000010"/>
            <path d="M22 6 L3 44 L41 44 Z" fill="#FFFCF0"/>
            <path d="M12 31 L32 31 L39 44 L5 44 Z" fill="#FFFCF0"/>
            <path d="M12 31 L32 31 L30 23 L14 23 Z" fill="#F5DFA0" opacity="0.85"/>
            <path d="M14 23 L30 23 L22 6 Z" fill="#FFFCF0"/>
            <ellipse cx="22" cy="22" rx="9" ry="4" fill="white"/>
            <path d="M18 14 Q22 7 26 14 Q29 20 22 22 Q15 20 18 14Z" fill="white"/>
            {[12,19,26,33].map((x,i)=><circle key={i} cx={x} cy={38} r="2" fill={["#FFD048","#C97B96","#7BB8E0","#E88A40"][i]} opacity="0.9"/>)}
          </svg>
        </div>

        {/* Slice 5 — chocolate, lower-center */}
        <div className="absolute pointer-events-none" style={{ top: "74%", left: "32%", opacity: 0.55, animation: "cs5 6.5s ease-in-out infinite 1.2s" }}>
          <svg viewBox="0 0 40 46" width="36" height="42" fill="none">
            <ellipse cx="20" cy="43" rx="13" ry="3.5" fill="#00000012"/>
            <path d="M20 6 L2 40 L38 40 Z" fill="#4A1E0C"/>
            <path d="M11 29 L29 29 L36 40 L4 40 Z" fill="#4A1E0C"/>
            <path d="M11 29 L29 29 L27 22 L13 22 Z" fill="#6A2E14" opacity="0.9"/>
            <path d="M13 22 L27 22 L20 6 Z" fill="#4A1E0C"/>
            <ellipse cx="20" cy="21" rx="8" ry="3.5" fill="#F5F0E8" opacity="0.9"/>
            <path d="M17 14 Q20 7 23 14 Q26 19 20 21 Q14 19 17 14Z" fill="white" opacity="0.88"/>
            <circle cx="20" cy="5" r="4" fill="#CC2030"/>
            <rect x="19" y="1" width="2" height="5" rx="1" fill="#5A9A20"/>
          </svg>
        </div>

        {/* Slice 6 — pink, right side lower */}
        <div className="absolute pointer-events-none" style={{ top: "55%", left: "45%", opacity: 0.5, animation: "cs6 5.2s ease-in-out infinite 0.6s" }}>
          <svg viewBox="0 0 40 46" width="34" height="40" fill="none">
            <ellipse cx="20" cy="43" rx="13" ry="3" fill="#00000010"/>
            <path d="M20 6 L2 40 L38 40 Z" fill="#F5DFA0"/>
            <path d="M11 29 L29 29 L36 40 L4 40 Z" fill="#F5DFA0"/>
            <path d="M11 29 L29 29 L27 22 L13 22 Z" fill="#ECC0D0" opacity="0.85"/>
            <path d="M13 22 L27 22 L20 6 Z" fill="#F5DFA0"/>
            <ellipse cx="20" cy="21" rx="8" ry="3.5" fill="white" opacity="0.9"/>
            <path d="M17 14 Q20 7 23 14 Q26 19 20 21 Q14 19 17 14Z" fill="white"/>
            <ellipse cx="14" cy="36" rx="4" ry="2.5" fill="#E03050" opacity="0.85"/>
            <ellipse cx="24" cy="34" rx="3.5" ry="2.5" fill="#E03050" opacity="0.75"/>
          </svg>
        </div>

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
            <>
              {/* Signature cakes — immersive panels, no card */}
              <SignatureCakes cakes={signatureCakes} onSelect={handleCakeSelect} />

              {/* All other cakes — standard grid */}
              {otherCakes.length > 0 && (
                <>
                  {signatureCakes.length > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-7 h-px bg-accent" />
                      <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-accent">More Creations</span>
                    </div>
                  )}
                  <CakeGallery cakes={otherCakes} />
                </>
              )}
            </>
          )}

          {/* Loading overlay for modal */}
          {loadingCake && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}

          {/* Modal for signature cake clicks */}
          {selectedCake && <CakeModal cake={selectedCake} onClose={() => setSelectedCake(null)} />}
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

      {/* Customer reviews */}
      <CustomerReviews />

      {/* Footer */}
      <Footer />
    </div>
  )
}
