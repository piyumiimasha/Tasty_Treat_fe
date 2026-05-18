import type { PriceBreakdown } from "@/lib/customizer-pricing"
import { Receipt } from "lucide-react"

function PriceLine({ label, amount, muted = false }: { label: string; amount: number; muted?: boolean }) {
  if (amount === 0) return null
  return (
    <div className={`flex justify-between text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      <span>{label}</span>
      <span className="font-medium">Rs. {amount.toLocaleString()}</span>
    </div>
  )
}

export default function PriceSummaryCard({ breakdown }: { breakdown: PriceBreakdown }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1.5px solid #f0cede", background: "rgba(255,255,255,0.82)" }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ background: "linear-gradient(135deg, #fde0ef 0%, #fdeef8 100%)", borderBottom: "1px solid #f0cede" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(201,123,150,0.15)" }}>
          <Receipt className="w-3.5 h-3.5" style={{ color: "#C97B96" }} />
        </div>
        <span className="text-sm font-semibold text-primary">Price Summary</span>
      </div>

      {/* Lines */}
      <div className="px-5 py-4 space-y-2">
        <PriceLine label="Base Price" amount={breakdown.baseSize} muted />
        {breakdown.lines.map((line) => (
          <PriceLine key={line.label} label={line.label} amount={line.amount} muted />
        ))}

        <div className="pt-2 mt-1 space-y-1.5" style={{ borderTop: "1px dashed #f0cede" }}>
          <div className="flex justify-between text-sm text-foreground">
            <span>{breakdown.layerCount > 1 ? `Subtotal (×${breakdown.layerCount} tiers)` : "Subtotal"}</span>
            <span className="font-medium">Rs. {breakdown.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (10%)</span>
            <span>Rs. {breakdown.tax.toLocaleString()}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center rounded-xl px-4 py-2.5 mt-2"
          style={{ background: "linear-gradient(135deg, #fde0ef, #fdeef8)", border: "1px solid #f0cede" }}>
          <span className="text-sm font-bold text-primary">Total</span>
          <span className="font-serif text-lg font-bold" style={{ color: "#A0526E" }}>
            Rs. {breakdown.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
