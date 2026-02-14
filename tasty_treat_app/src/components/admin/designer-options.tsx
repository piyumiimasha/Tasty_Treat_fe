"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { DesignerOption } from "@/lib/types/cake-designer"

const mockDesignerOptions: DesignerOption[] = [
  {
    id: "round",
    category: "shapes",
    name: "Round",
    price: 0,
  },
  {
    id: "square",
    category: "shapes",
    name: "Square",
    price: 5,
  },
  {
    id: "buttercream",
    category: "frosting",
    name: "Buttercream",
    price: 0,
  },
  {
    id: "ganache",
    category: "frosting",
    name: "Ganache",
    price: 12,
  },
  {
    id: "gold-drip",
    category: "toppers",
    name: "Gold Drip",
    price: 15,
    compatible: { maxLayers: 5 },
  },
  {
    id: "fresh-flowers",
    category: "toppers",
    name: "Fresh Flowers",
    price: 8,
  },
]

export default function DesignerOptions() {
  const [options, setOptions] = useState<DesignerOption[]>(mockDesignerOptions)
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("toppers")

  const deleteItem = (optionId: string | number) => {
    setOptions(options.filter((opt) => opt.id !== optionId))
  }

  const addItem = () => {
    if (newItemName.trim() === "" || newItemPrice.trim() === "") return

    const newOption: DesignerOption = {
      id: Date.now().toString(),
      category: newItemCategory as any,
      name: newItemName,
      price: Number.parseFloat(newItemPrice),
    }

    setOptions([...options, newOption])
    setNewItemName("")
    setNewItemPrice("")
  }

  const categories = ["shapes", "layers", "frosting", "colors", "toppers", "decorations"]
  const groupedOptions = categories.map((cat) => ({
    category: cat,
    items: options.filter((opt) => opt.category === cat),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cake Designer Options</CardTitle>
        <CardDescription>
          Manage cake customization options and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupedOptions.map((group) => (
            <div key={group.category} className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-semibold text-foreground capitalize">{group.category}</h3>

              {/* Items List */}
              <div className="mb-4 space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded bg-muted p-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          +Rs. {item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Item */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Plus className="mr-2 h-4 w-4" />
                    Add {group.category} Option
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add {group.category} Option</DialogTitle>
                    <DialogDescription>
                      Define the option name and additional price
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Option Name</label>
                      <Input
                        placeholder="e.g., Gold Drip"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Additional Price (Rs.)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                      />
                    </div>

                    <Button onClick={() => addItem()} className="w-full">
                      Add Option
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
