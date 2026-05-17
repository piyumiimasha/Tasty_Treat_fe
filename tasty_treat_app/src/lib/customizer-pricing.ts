import { BASE_PRICE, type OptionCategory, type CakeDesign } from "./customizer-options"

export interface PriceBreakdown {
  baseSize: number
  layerCount: number
  lines: { label: string; amount: number }[]
  subtotal: number
  tax: number
  total: number
}

export function calculateBreakdown(design: CakeDesign, categories: OptionCategory[], basePrice: number = BASE_PRICE): PriceBreakdown {
  // Determine tier count from the "layers" category
  const layersCategory = categories.find(c => c.key === "layers")
  let layerCount = 1
  if (layersCategory) {
    const selectedId = design[layersCategory.key]
    if (typeof selectedId === "string" && selectedId) {
      const selectedOption = layersCategory.options.find(o => o.id === selectedId)
      if (selectedOption) {
        const parsed = parseInt(selectedOption.label, 10)
        if (!isNaN(parsed) && parsed > 0) layerCount = parsed
      }
    }
  }

  const lines: { label: string; amount: number }[] = []

  for (const cat of categories) {
    if (cat.key === "layers") continue

    const val = design[cat.key]
    if (!val) continue

    if (cat.multiSelect && Array.isArray(val) && val.length > 0) {
      const amount = val.reduce((sum, id) => sum + (cat.options.find(o => o.id === id)?.price ?? 0), 0)
      if (amount > 0) lines.push({ label: cat.label, amount })
    } else if (!cat.multiSelect && typeof val === "string" && val) {
      const amount = cat.options.find(o => o.id === val)?.price ?? 0
      if (amount > 0) lines.push({ label: cat.label, amount })
    }
  }

  const optionsCost = lines.reduce((sum, l) => sum + l.amount, 0)
  const subtotal    = (basePrice + optionsCost) * layerCount
  const tax         = Math.round(subtotal * 0.1 * 100) / 100
  const total       = Math.round((subtotal + tax) * 100) / 100

  return { baseSize: basePrice, layerCount, lines, subtotal, tax, total }
}
