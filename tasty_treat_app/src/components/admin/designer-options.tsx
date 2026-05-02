"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Pencil, Circle, Layers, Droplets, Palette, Star, Sparkles, Tag } from "lucide-react"
import type { DesignerOption } from "@/lib/types/cake-designer"

const CATEGORIES: { id: DesignerOption["category"]; label: string; icon: React.ReactNode; color: string; accent: string }[] = [
  { id: "shapes",      label: "Shapes",      icon: <Circle className="w-4 h-4" />,    color: "text-violet-600",  accent: "bg-violet-50 border-violet-200"  },
  { id: "layers",      label: "Layers",      icon: <Layers className="w-4 h-4" />,    color: "text-blue-600",    accent: "bg-blue-50 border-blue-200"      },
  { id: "frosting",    label: "Frosting",    icon: <Droplets className="w-4 h-4" />,  color: "text-pink-600",    accent: "bg-pink-50 border-pink-200"      },
  { id: "colors",      label: "Colors",      icon: <Palette className="w-4 h-4" />,   color: "text-orange-600",  accent: "bg-orange-50 border-orange-200"  },
  { id: "toppers",     label: "Toppers",     icon: <Star className="w-4 h-4" />,      color: "text-amber-600",   accent: "bg-amber-50 border-amber-200"    },
  { id: "decorations", label: "Decorations", icon: <Sparkles className="w-4 h-4" />, color: "text-teal-600",    accent: "bg-teal-50 border-teal-200"      },
]

const INITIAL: DesignerOption[] = [
  { id: "round",         category: "shapes",      name: "Round",         price: 0  },
  { id: "square",        category: "shapes",      name: "Square",        price: 5  },
  { id: "heart",         category: "shapes",      name: "Heart",         price: 8  },
  { id: "buttercream",   category: "frosting",    name: "Buttercream",   price: 0  },
  { id: "ganache",       category: "frosting",    name: "Ganache",       price: 12 },
  { id: "fondant",       category: "frosting",    name: "Fondant",       price: 15 },
  { id: "gold-drip",     category: "toppers",     name: "Gold Drip",     price: 15 },
  { id: "fresh-flowers", category: "toppers",     name: "Fresh Flowers", price: 8  },
  { id: "2-layer",       category: "layers",      name: "2 Layers",      price: 0  },
  { id: "3-layer",       category: "layers",      name: "3 Layers",      price: 20 },
]

interface FormState { name: string; price: string }
const EMPTY_FORM: FormState = { name: "", price: "0" }

export default function DesignerOptions() {
  const [options, setOptions]             = useState<DesignerOption[]>(INITIAL)
  const [activeCategory, setActiveCategory] = useState<DesignerOption["category"]>("shapes")
  const [dialogOpen, setDialogOpen]       = useState(false)
  const [editingId, setEditingId]         = useState<string | number | null>(null)
  const [form, setForm]                   = useState<FormState>(EMPTY_FORM)

  const catMeta = CATEGORIES.find((c) => c.id === activeCategory)!
  const visible = options.filter((o) => o.category === activeCategory)

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (opt: DesignerOption) => {
    setEditingId(opt.id)
    setForm({ name: opt.name, price: String(opt.price) })
    setDialogOpen(true)
  }

  const handleSave = () => {
    const name  = form.name.trim()
    const price = parseFloat(form.price) || 0
    if (!name) return

    if (editingId != null) {
      setOptions((prev) => prev.map((o) => o.id === editingId ? { ...o, name, price } : o))
    } else {
      setOptions((prev) => [...prev, { id: Date.now().toString(), category: activeCategory, name, price }])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string | number) => setOptions((prev) => prev.filter((o) => o.id !== id))

  return (
    <div className="flex gap-6 min-h-[520px]">

      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 space-y-1">
        {CATEGORIES.map((cat) => {
          const count = options.filter((o) => o.category === cat.id).length
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-accent text-white shadow-sm shadow-accent/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={active ? "text-white" : cat.color}>{cat.icon}</span>
                {cat.label}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Main panel ── */}
      <div className="flex-1 min-w-0">
        {/* Panel header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${catMeta.accent} ${catMeta.color}`}>
              {catMeta.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight">{catMeta.label}</h3>
              <p className="text-xs text-muted-foreground">{visible.length} option{visible.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" />
            Add Option
          </Button>
        </div>

        {/* Options grid */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${catMeta.accent} ${catMeta.color}`}>
              {catMeta.icon}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No {catMeta.label.toLowerCase()} yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add your first option to get started</p>
            <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Option
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((opt) => (
              <div
                key={opt.id}
                className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-border/60 bg-card hover:shadow-md hover:border-accent/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${catMeta.accent} ${catMeta.color}`}>
                    {catMeta.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{opt.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {opt.price === 0 ? "Included" : `+Rs. ${opt.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEdit(opt)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(opt.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Edit" : "Add"} {catMeta.label} Option</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label htmlFor="opt-name">Option Name</Label>
              <Input
                id="opt-name"
                placeholder="e.g., Gold Drip"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
              />
            </div>
            <div>
              <Label htmlFor="opt-price">Additional Price (Rs.)</Label>
              <Input
                id="opt-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
              />
              <p className="text-xs text-muted-foreground mt-1">Enter 0 if included in base price.</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>
                {editingId != null ? "Save Changes" : "Add Option"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
