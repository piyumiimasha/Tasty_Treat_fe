"use client"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface IngredientOption {
  id: string
  label: string
  price: number
}

interface IngredientPickerProps {
  title: string
  type: "flavor" | "filling" | "dietary" | "topper"
  selected: string[]
  options: IngredientOption[]
  onChange: (selected: string[]) => void
  multiple?: boolean
}

export default function IngredientPicker({
  title,
  type,
  selected,
  options,
  onChange,
  multiple = false,
}: IngredientPickerProps) {
  const handleSelect = (id: string) => {
    if (multiple) {
      if (selected.includes(id)) {
        onChange(selected.filter((item) => item !== id))
      } else {
        onChange([...selected, id])
      }
    } else {
      onChange(selected[0] === id ? [] : [id])
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium">{title}</h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={selected.includes(option.id) ? "default" : "outline"}
            onClick={() => handleSelect(option.id)}
            className="justify-between"
          >
            <span>{option.label}</span>
            <div className="flex items-center gap-2">
              {option.price > 0 && <span className="text-xs font-semibold">+${option.price}</span>}
              {selected.includes(option.id) && <Check className="h-4 w-4" />}
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
