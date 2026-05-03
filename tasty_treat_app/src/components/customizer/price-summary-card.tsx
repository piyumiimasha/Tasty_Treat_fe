import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PriceBreakdown } from "@/lib/customizer-pricing"

interface PriceSummaryCardProps {
  breakdown: PriceBreakdown
}

function PriceLine({ label, amount, muted = false }: { label: string; amount: number; muted?: boolean }) {
  if (amount === 0) return null
  return (
    <div className={`flex justify-between text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      <span>{label}</span>
      <span>Rs. {amount.toLocaleString()}</span>
    </div>
  )
}

export default function PriceSummaryCard({ breakdown }: PriceSummaryCardProps) {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <PriceLine label="Base Size" amount={breakdown.baseSize} muted />
        <PriceLine label="Extra Layers" amount={breakdown.extraLayers} muted />
        <PriceLine label="Shape Surcharge" amount={breakdown.shapeSurcharge} muted />
        <PriceLine label="Flavours & Fillings" amount={breakdown.flavoursFillings} muted />
        <PriceLine label="Toppers" amount={breakdown.toppers} muted />
        <PriceLine label="Dietary Options" amount={breakdown.dietaryOptions} muted />

        <div className="border-t border-border pt-2 mt-2 space-y-1.5">
          <div className="flex justify-between text-sm text-foreground">
            <span>Subtotal</span>
            <span>Rs. {breakdown.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (10%)</span>
            <span>Rs. {breakdown.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-primary pt-1 border-t border-border">
            <span>Total</span>
            <span>Rs. {breakdown.total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
