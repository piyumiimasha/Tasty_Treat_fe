"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"

export interface FilterPanelProps {
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  selectedFlavors: string[]
  setSelectedFlavors: (flavors: string[]) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}

const FLAVORS    = ["Vanilla", "Chocolate", "Strawberry", "Lemon", "Carrot", "Red Velvet"]
const CATEGORIES = ["All Cakes", "Wedding Cakes", "Birthday Cakes", "Cupcakes", "Desserts", "Custom Designs"]

export default function FilterPanel({
  priceRange,
  setPriceRange,
  selectedFlavors,
  setSelectedFlavors,
  selectedCategory,
  setSelectedCategory,
}: FilterPanelProps) {
  const [open, setOpen] = useState({ type: true, price: true, flavor: true })
  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }))

  const toggleFlavor = (f: string) =>
    setSelectedFlavors(
      selectedFlavors.includes(f)
        ? selectedFlavors.filter((x) => x !== f)
        : [...selectedFlavors, f],
    )

  return (
    <div className="space-y-3">

      {/* ── Cake Type ── */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <button
          onClick={() => toggle("type")}
          className="flex items-center justify-between w-full px-4 py-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground">Cake Type</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open.type ? "rotate-180" : ""}`} />
        </button>

        {open.type && (
          <div className="px-4 py-3 space-y-0.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    active ? "bg-accent/12 text-accent" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {/* radio dot */}
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      active ? "border-accent bg-accent" : "border-border"
                    }`}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm font-medium">{cat}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Price Range ── */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <button
          onClick={() => toggle("price")}
          className="flex items-center justify-between w-full px-4 py-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground">Price Range</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open.price ? "rotate-180" : ""}`} />
        </button>

        {open.price && (
          <div className="px-5 py-5 space-y-5">
            <Slider
              min={0}
              max={500}
              step={5}
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as [number, number])}
              className="w-full"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 text-center bg-muted rounded-lg py-1.5 text-xs font-semibold text-foreground">
                Rs.&nbsp;{priceRange[0]}
              </div>
              <div className="w-4 h-px bg-border" />
              <div className="flex-1 text-center bg-muted rounded-lg py-1.5 text-xs font-semibold text-foreground">
                Rs.&nbsp;{priceRange[1]}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Flavour ── */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <button
          onClick={() => toggle("flavor")}
          className="flex items-center justify-between w-full px-4 py-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground">Flavour</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open.flavor ? "rotate-180" : ""}`} />
        </button>

        {open.flavor && (
          <div className="px-4 py-3 space-y-0.5">
            {FLAVORS.map((name) => {
              const checked = selectedFlavors.includes(name)
              return (
                <label
                  key={name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-colors ${
                    checked ? "bg-accent/12 text-accent" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked ? "bg-accent border-accent" : "border-border"
                    }`}
                  >
                    {checked && (
                      <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleFlavor(name)} className="sr-only" />
                  <span className="text-sm font-medium">{name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
