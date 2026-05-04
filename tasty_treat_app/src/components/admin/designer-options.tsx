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
import {
  getCustomizationTypes,
  updateCustomizationType,
  type CustomizationTypeDto,
} from "@/lib/api/customization-types"

// Static icon/colour metadata keyed by type.name
const TYPE_META: Record<string, { icon: React.ReactNode; color: string; accent: string }> = {
  shapes:      { icon: <Circle className="w-4 h-4" />,    color: "text-violet-600",  accent: "bg-violet-50 border-violet-200"  },
  layers:      { icon: <Layers className="w-4 h-4" />,    color: "text-blue-600",    accent: "bg-blue-50 border-blue-200"      },
  frosting:    { icon: <Droplets className="w-4 h-4" />,  color: "text-pink-600",    accent: "bg-pink-50 border-pink-200"      },
  flavour:     { icon: <Cake className="w-4 h-4" />,      color: "text-rose-600",    accent: "bg-rose-50 border-rose-200"      },
  colors:      { icon: <Palette className="w-4 h-4" />,   color: "text-orange-600",  accent: "bg-orange-50 border-orange-200"  },
  toppers:     { icon: <Star className="w-4 h-4" />,      color: "text-amber-600",   accent: "bg-amber-50 border-amber-200"    },
  decorations: { icon: <Sparkles className="w-4 h-4" />,  color: "text-teal-600",    accent: "bg-teal-50 border-teal-200"      },
  dietary:     { icon: <Leaf className="w-4 h-4" />,      color: "text-green-600",   accent: "bg-green-50 border-green-200"    },
}

const DEFAULT_META = { icon: <Tag className="w-4 h-4" />, color: "text-muted-foreground", accent: "bg-muted border-border" }

interface FormState { name: string; price: string }
const EMPTY_FORM: FormState = { name: "", price: "0" }

export default function DesignerOptions() {
  const { toast } = useToast()
  const [types, setTypes]                     = useState<CustomizationTypeDto[]>([])
  const [options, setOptions]                 = useState<CustomizationOptionDto[]>([])
  const [loading, setLoading]                 = useState(true)
  const [activeTypeId, setActiveTypeId]       = useState<number | null>(null)
  const [dialogOpen, setDialogOpen]           = useState(false)
  const [editingId, setEditingId]             = useState<number | null>(null)
  const [form, setForm]                       = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]                   = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [fetchedTypes, fetchedOptions] = await Promise.all([
        getCustomizationTypes(),
        getDesignerOptions(),
      ])
      setTypes(fetchedTypes)
      setOptions(fetchedOptions)
      if (fetchedTypes.length > 0 && activeTypeId === null) {
        setActiveTypeId(fetchedTypes[0].typeId)
      }
    } catch {
      toast({ title: "Error", description: "Failed to load designer options.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast, activeTypeId])

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeType = types.find((t) => t.typeId === activeTypeId)
  const catMeta    = activeType ? (TYPE_META[activeType.name] ?? DEFAULT_META) : DEFAULT_META
  const visible    = options.filter((o) => o.typeId === activeTypeId)

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
    if (!name || activeTypeId === null) return

    setSaving(true)
    try {
      if (editingId != null) {
        const updated = await updateDesignerOption(editingId, { name, additionalPrice: price })
        setOptions((prev) => prev.map((o) => o.optionId === editingId ? updated : o))
      } else {
        const created = await createDesignerOption({ name, typeId: activeTypeId, additionalPrice: price })
        setOptions((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch {
      toast({ title: "Error", description: "Failed to save option.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMultiSelect = async (type: CustomizationTypeDto) => {
    try {
      const updated = await updateCustomizationType(type.typeId, { isMultiSelect: !type.isMultiSelect })
      setTypes((prev) => prev.map((t) => t.typeId === type.typeId ? { ...t, isMultiSelect: updated.isMultiSelect } : t))
      toast({ title: "Updated", description: `${type.name} is now ${updated.isMultiSelect ? "multi-select" : "single-select"}.` })
    } catch {
      toast({ title: "Error", description: "Failed to update type.", variant: "destructive" })
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
        {types.map((type) => {
          const meta   = TYPE_META[type.name] ?? DEFAULT_META
          const count  = options.filter((o) => o.typeId === type.typeId).length
          const active = activeTypeId === type.typeId
          return (
            <button
              key={type.typeId}
              onClick={() => setActiveTypeId(type.typeId)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-accent text-white shadow-sm shadow-accent/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={active ? "text-white" : meta.color}>{meta.icon}</span>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${catMeta.accent} ${catMeta.color}`}>
              {catMeta.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight">{activeType ? activeType.name.charAt(0).toUpperCase() + activeType.name.slice(1) : "—"}</h3>
              <p className="text-xs text-muted-foreground">{visible.length} option{visible.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeType && (
              <button
                onClick={() => handleToggleMultiSelect(activeType)}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  activeType.isMultiSelect
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle whether customers can pick multiple options in this category"
              >
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  activeType.isMultiSelect ? "border-accent bg-accent" : "border-muted-foreground"
                }`}>
                  {activeType.isMultiSelect && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                Multi-select
              </button>
            )}
            <Button size="sm" onClick={openAdd} className="gap-1.5 rounded-lg" disabled={loading || activeTypeId === null}>
              <Plus className="w-3.5 h-3.5" />
              Add Option
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${catMeta.accent} ${catMeta.color}`}>
              {catMeta.icon}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No {activeType?.name.toLowerCase() ?? "options"} yet</p>
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
            <DialogTitle>{editingId != null ? "Edit" : "Add"} {activeType ? activeType.name.charAt(0).toUpperCase() + activeType.name.slice(1) : ""} Option</DialogTitle>
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
