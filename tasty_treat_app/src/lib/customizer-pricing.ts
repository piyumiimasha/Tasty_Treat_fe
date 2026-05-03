import { BASE_PRICE, findOptionPrice, type CakeDesign } from "./customizer-options"

export interface PriceBreakdown {
  baseSize: number
  extraLayers: number
  flavoursFillings: number
  dietaryOptions: number
  toppers: number
  shapeSurcharge: number
  colorSurcharge: number
  decorationsCost: number
  subtotal: number
  tax: number
  total: number
}

export function calculatePrice(design: CakeDesign): PriceBreakdown {
  const baseSize        = BASE_PRICE
  const extraLayers     = findOptionPrice("layers", String(design.layers))
  const flavoursFillings = findOptionPrice("flavour", design.flavour)
  const dietaryOptions  = design.dietary.reduce((sum, d) => sum + findOptionPrice("dietary", d), 0)
  const toppers         = findOptionPrice("topper", design.topper)
  const shapeSurcharge  = findOptionPrice("shape", design.shape)
  const colorSurcharge  = findOptionPrice("color", design.color)
  const decorationsCost = design.decorations.reduce((sum, d) => sum + findOptionPrice("decorations", d), 0)

  const subtotal = baseSize + extraLayers + flavoursFillings + dietaryOptions + toppers + shapeSurcharge + colorSurcharge + decorationsCost
  const tax      = Math.round(subtotal * 0.1 * 100) / 100
  const total    = Math.round((subtotal + tax) * 100) / 100

  return { baseSize, extraLayers, flavoursFillings, dietaryOptions, toppers, shapeSurcharge, colorSurcharge, decorationsCost, subtotal, tax, total }
}
