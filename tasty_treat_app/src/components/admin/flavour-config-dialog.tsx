"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Edit, Check, X } from "lucide-react"
import {
  ItemFlavourDto,
  getFlavoursByItem,
  createFlavour,
  updateFlavour,
  deleteFlavour,
} from "@/lib/api/item-flavours"

interface FlavourConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cakeId: number
  cakeName: string
}

export default function FlavourConfigDialog({ open, onOpenChange, cakeId, cakeName }: FlavourConfigDialogProps) {
  const [flavours, setFlavours] = useState<ItemFlavourDto[]>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadFlavours()
    }
  }, [open, cakeId])

  const loadFlavours = async () => {
    try {
      setLoading(true)
      const data = await getFlavoursByItem(cakeId)
      setFlavours(data)
    } catch {
      toast({ title: "Error", description: "Failed to load flavours", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    const price = parseFloat(newPrice) || 0
    try {
      setAdding(true)
      const created = await createFlavour(cakeId, { name: newName.trim(), extraPrice: price })
      setFlavours((prev) => [...prev, created])
      setNewName("")
      setNewPrice("")
      toast({ title: "Success", description: "Flavour added" })
    } catch {
      toast({ title: "Error", description: "Failed to add flavour", variant: "destructive" })
    } finally {
      setAdding(false)
    }
  }

  const startEdit = (f: ItemFlavourDto) => {
    setEditingId(f.itemFlavourId)
    setEditName(f.name)
    setEditPrice(f.extraPrice.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditPrice("")
  }

  const handleSaveEdit = async (id: number) => {
    try {
      const updated = await updateFlavour(cakeId, id, {
        name: editName.trim(),
        extraPrice: parseFloat(editPrice) || 0,
      })
      setFlavours((prev) => prev.map((f) => (f.itemFlavourId === id ? updated : f)))
      cancelEdit()
      toast({ title: "Success", description: "Flavour updated" })
    } catch {
      toast({ title: "Error", description: "Failed to update flavour", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteFlavour(cakeId, id)
      setFlavours((prev) => prev.filter((f) => f.itemFlavourId !== id))
      toast({ title: "Success", description: "Flavour deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete flavour", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Flavours — {cakeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new flavour */}
          <div className="rounded-lg border border-border/60 p-3 space-y-2 bg-muted/20">
            <p className="text-sm font-semibold text-foreground">Add Flavour</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="new-flavour-name" className="text-xs">Name</Label>
                <Input
                  id="new-flavour-name"
                  placeholder="e.g. Vanilla"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-28">
                <Label htmlFor="new-flavour-price" className="text-xs">Extra Price (Rs.)</Label>
                <Input
                  id="new-flavour-price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button size="sm" onClick={handleAdd} disabled={adding || !newName.trim()} className="h-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Flavour list */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : flavours.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No flavours configured yet.</p>
            ) : (
              flavours.map((f) =>
                editingId === f.itemFlavourId ? (
                  <div key={f.itemFlavourId} className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/5 px-3 py-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="h-7 text-sm w-24"
                    />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => handleSaveEdit(f.itemFlavourId)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div key={f.itemFlavourId} className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2 hover:bg-muted/40 transition-colors">
                    <span className="text-sm font-medium">{f.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {f.extraPrice > 0 ? `+Rs. ${f.extraPrice}` : "Included"}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(f)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(f.itemFlavourId)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
