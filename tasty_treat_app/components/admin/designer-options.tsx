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
    visualMetadata: { type: "shape", layer: "base", value: "circle" },
  },
  {
    id: "square",
    category: "shapes",
    name: "Square",
    price: 5,
    visualMetadata: { type: "shape", layer: "base", value: "square" },
  },
  {
    id: "buttercream",
    category: "frosting",
    name: "Buttercream",
    price: 0,
    visualMetadata: { type: "color", layer: "icing", value: "#FFF8DC" },
  },
  {
    id: "ganache",
    category: "frosting",
    name: "Ganache",
    price: 12,
    visualMetadata: { type: "color", layer: "icing", value: "#3D2817", effect: "glossy" },
  },
  {
    id: "gold-drip",
    category: "toppers",
    name: "Gold Drip",
    price: 15,
    visualMetadata: { type: "effect", layer: "icing", value: "drip", color: "#FFD700" },
    compatible: { maxLayers: 5 },
  },
  {
    id: "fresh-flowers",
    category: "toppers",
    name: "Fresh Flowers",
    price: 8,
    visualMetadata: { type: "image", layer: "topper", value: "🌸" },
  },
]

export default function DesignerOptions() {
  const [options, setOptions] = useState<DesignerOption[]>(mockDesignerOptions)
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("toppers")
  const [newItemColor, setNewItemColor] = useState("#FFD700")
  const [newItemEffect, setNewItemEffect] = useState("")
  const [newItemValue, setNewItemValue] = useState("")

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
      visualMetadata: {
        type: newItemEffect ? "effect" : "color",
        layer: "topper",
        value: newItemValue || newItemColor,
        effectConfig: newItemEffect ? { effect: newItemEffect } : undefined,
      },
    }

    setOptions([...options, newOption])
    setNewItemName("")
    setNewItemPrice("")
    setNewItemColor("#FFD700")
    setNewItemEffect("")
    setNewItemValue("")
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
          Manage options with visual metadata - changes automatically update the preview
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
                      <div
                        className="h-6 w-6 rounded"
                        style={{
                          backgroundColor: item.visualMetadata.type === "color" ? item.visualMetadata.value : "#E5E7EB",
                        }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          +${item.price.toFixed(2)} • {item.visualMetadata.layer} layer
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
                      Define the option name, price, and visual properties it will render with
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
                      <label className="text-sm font-medium">Additional Price ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Visual Type</label>
                      <select
                        className="w-full rounded border border-input bg-background px-3 py-2"
                        value={newItemColor ? "color" : "effect"}
                        onChange={(e) => {
                          if (e.target.value === "color") setNewItemEffect("")
                          else setNewItemColor("")
                        }}
                      >
                        <option value="color">Color</option>
                        <option value="effect">Effect</option>
                      </select>
                    </div>

                    {!newItemEffect && (
                      <div>
                        <label className="text-sm font-medium">Color Value</label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={newItemColor}
                            onChange={(e) => setNewItemColor(e.target.value)}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            placeholder="#FFD700"
                            value={newItemColor}
                            onChange={(e) => setNewItemColor(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {newItemEffect && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Effect Type</label>
                          <select className="w-full rounded border border-input bg-background px-3 py-2">
                            <option>drip</option>
                            <option>glossy</option>
                            <option>matte</option>
                            <option>sparkle</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Effect Color</label>
                          <Input type="color" value={newItemColor} onChange={(e) => setNewItemColor(e.target.value)} />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-sm font-medium">Display Value (Icon/Emoji)</label>
                      <Input
                        placeholder="🌸"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(e.target.value)}
                        maxLength={2}
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
