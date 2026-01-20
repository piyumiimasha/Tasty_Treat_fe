"use client"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PriceCalculatorProps {
  options: any
}

export default function PriceCalculator({ options }: PriceCalculatorProps) {
  const pricing = useMemo(() => {
    let basePrice = 35

    // Size pricing
    const sizePricing: Record<string, number> = {
      small: 35,
      medium: 50,
      large: 70,
      "extra-large": 95,
    }
    basePrice = sizePricing[options.size] || 50

    // Layer surcharge
    const layerSurcharge = Math.max(0, options.layers - 2) * 10

    // Flavor/filling extras
    let ingredientPrice = 0
    const flavorPricing: Record<string, number> = {
      "red-velvet": 4,
      carrot: 3,
      lemon: 3,
      strawberry: 4,
      chocolate: 3,
    }
    ingredientPrice += flavorPricing[options.flavors[0]] || 0

    const fillingPricing: Record<string, number> = {
      chocolate: 2,
      fruit: 3,
      caramel: 3,
    }
    ingredientPrice += fillingPricing[options.fillings[0]] || 1

    // Dietary options
    let dietaryPrice = 0
    if (options.dietary.includes("vegan")) dietaryPrice += 5
    if (options.dietary.includes("gluten-free")) dietaryPrice += 4
    if (options.dietary.includes("dairy-free")) dietaryPrice += 5

    // Toppers
    let topperPrice = 0
    const topperPricing: Record<string, number> = {
      "fresh-flowers": 8,
      "gold-leaf": 6,
      berries: 5,
      "custom-message": 3,
      sprinkles: 2,
      macarons: 10,
    }
    topperPrice = options.toppers.reduce((sum: number, topper: string) => sum + (topperPricing[topper] || 0), 0)

    const subtotal = basePrice + layerSurcharge + ingredientPrice + dietaryPrice + topperPrice
    const tax = Math.round(subtotal * 0.1 * 100) / 100
    const total = subtotal + tax

    return {
      basePrice,
      layerSurcharge,
      ingredientPrice,
      dietaryPrice,
      topperPrice,
      subtotal,
      tax,
      total,
    }
  }, [options])

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Size:</span>
            <span className="font-medium">${pricing.basePrice.toFixed(2)}</span>
          </div>
          {pricing.layerSurcharge > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Extra Layers:</span>
              <span className="font-medium">+${pricing.layerSurcharge.toFixed(2)}</span>
            </div>
          )}
          {pricing.ingredientPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flavors & Fillings:</span>
              <span className="font-medium">+${pricing.ingredientPrice.toFixed(2)}</span>
            </div>
          )}
          {pricing.dietaryPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dietary Options:</span>
              <span className="font-medium">+${pricing.dietaryPrice.toFixed(2)}</span>
            </div>
          )}
          {pricing.topperPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toppers & Decor:</span>
              <span className="font-medium">+${pricing.topperPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%):</span>
            <span>${pricing.tax.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">${pricing.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p>
            Prices update in real-time as you customize. Ready for{" "}
            {options.size === "small"
              ? "8-12"
              : options.size === "medium"
                ? "16-20"
                : options.size === "large"
                  ? "24-30"
                  : "40-50"}{" "}
            servings.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
