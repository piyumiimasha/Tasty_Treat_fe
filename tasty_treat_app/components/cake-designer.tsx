"use client"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import CakePreview from "./cake-preview"
import type { DesignerOption } from "@/lib/types/cake-designer"

interface CakeDesignerProps {
  options: any
  onOptionChange: (key: string, value: any) => void
  designerOptions?: DesignerOption[]
}

export default function CakeDesigner({ options, onOptionChange, designerOptions = [] }: CakeDesignerProps) {
  const shapes = [
    { id: "round", label: "Round", icon: "⭕" },
    { id: "square", label: "Square", icon: "⬜" },
    { id: "rectangle", label: "Rectangle", icon: "▭" },
    { id: "heart", label: "Heart", icon: "♥️" },
  ]

  const frostings = [
    { id: "buttercream", label: "Buttercream", color: "bg-yellow-100" },
    { id: "fondant", label: "Fondant", color: "bg-slate-100" },
    { id: "ganache", label: "Ganache", color: "bg-amber-900" },
    { id: "cream-cheese", label: "Cream Cheese", color: "bg-orange-50" },
  ]

  const sizes = [
    { id: "small", label: "Small (6 inches)", servings: "8-12" },
    { id: "medium", label: "Medium (8 inches)", servings: "16-20" },
    { id: "large", label: "Large (10 inches)", servings: "24-30" },
    { id: "extra-large", label: "Extra Large (12 inches)", servings: "40-50" },
  ]

  const colors = [
    "#8B6F47",
    "#D4A574",
    "#FFFFFF",
    "#000000",
    "#FF69B4",
    "#FFB6C1",
    "#87CEEB",
    "#90EE90",
    "#FFD700",
    "#8B4513",
    "#DEB887",
    "#A9A9A9",
  ]

  return (
    <div className="space-y-6">
      <CakePreview designState={options} designerOptions={designerOptions} />

      {/* Layers */}
      <div>
        <label className="text-sm font-medium mb-3 block">Number of Layers</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              variant={options.layers === num ? "default" : "outline"}
              size="sm"
              onClick={() => onOptionChange("layers", num)}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {/* Shape */}
      <div>
        <label className="text-sm font-medium mb-3 block">Cake Shape</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {shapes.map((shape) => (
            <Button
              key={shape.id}
              variant={options.shape === shape.id ? "default" : "outline"}
              size="sm"
              onClick={() => onOptionChange("shape", shape.id)}
              className="flex flex-col gap-1"
            >
              <span className="text-xl">{shape.icon}</span>
              <span className="text-xs">{shape.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Frosting Type */}
      <div>
        <label className="text-sm font-medium mb-3 block">Frosting Type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {frostings.map((frosting) => (
            <Button
              key={frosting.id}
              variant={options.frosting === frosting.id ? "default" : "outline"}
              size="sm"
              onClick={() => onOptionChange("frosting", frosting.id)}
              className={frosting.color}
            >
              {frosting.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Palette className="h-4 w-4" />
          Cake Color
        </label>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onOptionChange("colors", [color])}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                options.colors[0] === color ? "border-foreground scale-110" : "border-border"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="text-sm font-medium mb-3 block">Cake Size</label>
        <div className="space-y-2">
          {sizes.map((size) => (
            <Button
              key={size.id}
              variant={options.size === size.id ? "default" : "outline"}
              className="w-full justify-between"
              onClick={() => onOptionChange("size", size.id)}
            >
              <span>{size.label}</span>
              <span className="text-xs text-muted-foreground">({size.servings})</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
