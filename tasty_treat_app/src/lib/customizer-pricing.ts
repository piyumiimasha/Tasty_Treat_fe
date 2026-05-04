import { BASE_PRICE, type OptionCategory, type CakeDesign } from "./customizer-options"

export interface PriceBreakdown {
  baseSize: number
  lines: { label: string; amount: number }[]
  subtotal: number
  tax: number
  total: number
}

export function calculateBreakdown(design: CakeDesign, categories: OptionCategory[]): PriceBreakdown {
  const lines: { label: string; amount: number }[] = []

  for (const cat of categories) {
    const val = design[cat.key]
    if (!val) continue

    if (cat.multiSelect && Array.isArray(val) && val.length > 0) {
      const amount = val.reduce((sum, id) => sum + (cat.options.find(o => o.id === id)?.price ?? 0), 0)
      if (amount > 0) lines.push({ label: cat.label, amount })
    } else if (!cat.multiSelect && typeof val === 'string' && val) {
      const amount = cat.options.find(o => o.id === val)?.price ?? 0
      if (amount > 0) lines.push({ label: cat.label, amount })
    }
  }

  const optionsCost = lines.reduce((sum, l) => sum + l.amount, 0)
  const subtotal    = BASE_PRICE + optionsCost
  const tax         = Math.round(subtotal * 0.1 * 100) / 100
  const total       = Math.round((subtotal + tax) * 100) / 100

  return { baseSize: BASE_PRICE, lines, subtotal, tax, total }
}
