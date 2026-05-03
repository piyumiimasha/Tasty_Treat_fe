"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Pencil, Circle, Layers, Droplets, Palette, Star, Sparkles, Tag, Leaf, Cake } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getDesignerOptions,
  createDesignerOption,
  updateDesignerOption,
  deleteDesignerOption,
  type CustomizationOptionDto,
} from "@/lib/api/customization-options"

const CATEGORIES: { id: string; label: string; icon: React.ReactNode; color: string; accent: string }[] = [
  { id: "shapes",      label: "Shapes",      icon: <Circle className="w-4 h-4" />,    color: "text-violet-600",  accent: "bg-violet-50 border-violet-200"  },
  { id: "layers",      label: "Layers",      icon: <Layers className="w-4 h-4" />,    color: "text-blue-600",    accent: "bg-blue-50 border-blue-200"      },
  { id: "frosting",    label: "Frosting",    icon: <Droplets className="w-4 h-4" />,  color: "text-pink-600",    accent: "bg-pink-50 border-pink-200"      },
  { id: "flavour",     label: "Flavour",     icon: <Cake className="w-4 h-4" />,      color: "text-rose-600",    accent: "bg-rose-50 border-rose-200"      },
  { id: "colors",      label: "Colors",      icon: <Palette className="w-4 h-4" />,   color: "text-orange-600",  accent: "bg-orange-50 border-orange-200"  },
  { id: "toppers",     label: "Toppers",     icon: <Star className="w-4 h-4" />,      color: "text-amber-600",   accent: "bg-amber-50 border-amber-200"    },
  { id: "decorations", label: "Decorations", icon: <Sparkles className="w-4 h-4" />, color: "text-teal-600",    accent: "bg-teal-50 border-teal-200"      },
  { id: "dietary",     label: "Dietary",     icon: <Leaf className="w-4 h-4" />,      color: "text-green-600",   accent: "bg-green-50 border-green-200"    },
]

interface FormState { name: string; price: string }
const EMPTY_FORM: FormState = { name: "", price: "0" }

export default function DesignerOptions() {
  const { toast } = useToast()
  const [options, setOptions]               = useState<CustomizationOptionDto[]>([])
  const [loading, setLoading]               = useState(true)
  const [activeCategory, setActiveCategory] = useState("shapes")
  const [dialogOpen, setDialogOpen]         = useState(false)
  const [editingId, setEditingId]           = useState<number | null>(null)
  const [form, setForm]                     = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]                 = useState(false)

  const catMeta = CATEGORIES.find((c) => c.id === activeCategory)!
  const visible = options.filter((o) => o.type === activeCategory)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDesignerOptions()
      setOptions(data)
    } catch {
      toast({ title: "Error", description: "Failed to load designer options.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (opt: CustomizationOptionDto) => {
    setEditingId(opt.optionId)
    setForm({ name: opt.name, price: String(opt.additionalPrice) })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const name  = form.name.trim()
    const price = parseFloat(form.price) || 0
    if (!name) return

    setSaving(true)
    try {
      if (editingId != null) {
        const updated = await updateDesignerOption(editingId, { name, additionalPrice: price })
        setOptions((prev) => prev.map((o) => o.optionId === editingId ? updated : o))
      } else {
        const created = await createDesignerOption({ name, type: activeCategory, additionalPrice: price })
        setOptions((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch {
      toast({ title: "Error", description: "Failed to save option.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDesignerOption(id)
      setOptions((prev) => prev.filter((o) => o.optionId !== id))
    } catch {
      toast({ title: "Error", description: "Failed to delete option.", variant: "destructive" })
    }
  }

  return (
    <div className="flex gap-6 min-h-[520px]">

      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 space-y-1">
        {CATEGORIES.map((cat) => {
          const count  = options.filter((o) => o.type === cat.id).length
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
          <Button size="sm" onClick={openAdd} className="gap-1.5 rounded-lg" disabled={loading}>
            <Plus className="w-3.5 h-3.5" />
            Add Option
          </Button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : visible.length === 0 ? (
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
                key={opt.optionId}
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
                        {opt.additionalPrice === 0 ? "Included" : `+Rs. ${opt.additionalPrice.toFixed(2)}`}
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
                    onClick={() => handleDelete(opt.optionId)}
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
              <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim() || saving}>
                {saving ? "Saving…" : editingId != null ? "Save Changes" : "Add Option"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
