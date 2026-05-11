"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Search, X, UtensilsCrossed, ChevronDown, ChevronUp, Tag, Check } from "lucide-react"
import { getAllItems, createItem, updateItem, deleteItem } from "@/lib/api/items"
import { mapItemToCake, mapCakeToCreateItem, mapCakeToUpdateItem, Cake } from "@/lib/mappers/item-mapper"
import FlavourConfigDialog from "@/components/admin/flavour-config-dialog"
import { CategoryDto, getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/categories"

interface FormData {
  name: string
  category: string
  price: number
  size: string
  flavor: string
  images: string
}

interface CakeFormFieldsProps {
  formData: FormData
  setFormData: (data: FormData) => void
  imagePreviews: string[]
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: () => void
  categories: CategoryDto[]
}

function CakeFormFields({ formData, setFormData, imagePreviews, handleImageChange, removeImage, categories }: CakeFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Cake Name *</Label>
        <Input
          id="name"
          placeholder="Enter cake name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <select
          id="category"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          {categories.length === 0 && <option value="">No categories — add one below</option>}
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (Rs.) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            placeholder="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="size">Size *</Label>
          <Input
            id="size"
            placeholder="e.g., 2 kg"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="flavor">Flavor *</Label>
        <Input
          id="flavor"
          placeholder="e.g., Vanilla Bean & Champagne"
          value={formData.flavor}
          onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="images">Upload Image</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground mt-1">Accepted formats: JPG, PNG, GIF, WEBP (max 5MB)</p>
        {imagePreviews.length > 0 && (
          <div className="mt-3">
            <div className="relative group inline-block">
              <img src={imagePreviews[0]} alt="Preview" className="w-40 h-40 object-cover rounded border" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryManager({ categories, onRefresh }: { categories: CategoryDto[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createCategory(newName.trim())
      setNewName("")
      onRefresh()
      toast({ title: "Category added" })
    } catch {
      toast({ title: "Error", description: "Failed to add category.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return
    setSaving(true)
    try {
      await updateCategory(id, editingName.trim())
      setEditingId(null)
      onRefresh()
      toast({ title: "Category updated" })
    } catch {
      toast({ title: "Error", description: "Failed to update category.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return
    try {
      await deleteCategory(id)
      onRefresh()
      toast({ title: "Category deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" })
    }
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            Manage Categories
            <span className="text-sm font-normal text-muted-foreground">({categories.length})</span>
          </CardTitle>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          {/* Existing categories */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.categoryId} className="flex items-center gap-2">
                {editingId === cat.categoryId ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(cat.categoryId) }}
                      className="h-8 flex-1"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleUpdate(cat.categoryId)} disabled={saving}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm px-2 py-1 rounded bg-secondary/30 border border-border">{cat.name}</span>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingId(cat.categoryId); setEditingName(cat.name) }}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(cat.categoryId)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="flex gap-2 pt-1 border-t border-border">
            <Input
              placeholder="New category name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
              className="h-8 flex-1"
            />
            <Button size="sm" className="h-8" onClick={handleAdd} disabled={saving || !newName.trim()}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function CakeManagement() {
  const [cakes, setCakes] = useState<Cake[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCake, setEditingCake] = useState<Cake | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flavourDialogCake, setFlavourDialogCake] = useState<Cake | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    price: 0,
    size: "",
    flavor: "",
    images: "",
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
      return data
    } catch {
      return []
    }
  }

  const loadAll = async () => {
    try {
      setLoading(true)
      const [items, cats] = await Promise.all([getAllItems(), getCategories()])
      setCakes(items.map(mapItemToCake))
      setCategories(cats)
    } catch {
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (cats = categories) => {
    setFormData({
      name: "",
      category: cats[0]?.name ?? "",
      price: 0,
      size: "",
      flavor: "",
      images: "",
    })
    setImageFiles([])
    setImagePreviews([])
  }

  const handleAddCake = async () => {
    if (!formData.name || !formData.flavor || !formData.size) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    try {
      setSubmitting(true)
      const newCake: Omit<Cake, "id"> = {
        name: formData.name, category: formData.category, price: formData.price,
        size: formData.size, flavor: formData.flavor, rating: 0, images: [], videos: [],
      }
      await createItem(mapCakeToCreateItem(newCake), imageFiles[0])
      setIsAddDialogOpen(false)
      resetForm()
      toast({ title: "Success", description: "Cake added successfully" })
      await loadAll()
    } catch {
      toast({ title: "Error", description: "Failed to add cake.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCake = async () => {
    if (!editingCake || !formData.name || !formData.flavor || !formData.size) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    try {
      setSubmitting(true)
      const updatedCake: Partial<Cake> = {
        name: formData.name, category: formData.category, price: formData.price,
        size: formData.size, flavor: formData.flavor,
      }
      await updateItem(editingCake.id, mapCakeToUpdateItem(updatedCake), imageFiles[0])
      setIsEditDialogOpen(false)
      setEditingCake(null)
      resetForm()
      toast({ title: "Success", description: "Cake updated successfully" })
      await loadAll()
    } catch {
      toast({ title: "Error", description: "Failed to update cake.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCake = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cake?")) return
    try {
      await deleteItem(id)
      toast({ title: "Success", description: "Cake deleted successfully" })
      await loadAll()
    } catch {
      toast({ title: "Error", description: "Failed to delete cake.", variant: "destructive" })
    }
  }

  const openEditDialog = (cake: Cake) => {
    setEditingCake(cake)
    setFormData({ name: cake.name, category: cake.category, price: cake.price, size: cake.size, flavor: cake.flavor, images: cake.images.join(", ") })
    setImageFiles([])
    setImagePreviews(cake.images.length > 0 ? [cake.images[0]] : [])
    setIsEditDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) { setImageFiles([]); setImagePreviews([]); return }
    setImageFiles([file])
    setImagePreviews([URL.createObjectURL(file)])
  }

  const filteredCakes = cakes.filter(
    (cake) =>
      cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cake.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cake.flavor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formProps: CakeFormFieldsProps = {
    formData, setFormData, imagePreviews, handleImageChange,
    removeImage: () => { setImageFiles([]); setImagePreviews([]) },
    categories,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cake Management</h2>
          <p className="text-sm text-muted-foreground">Manage cakes displayed in the browse page</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Cake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Cake</DialogTitle>
              <DialogDescription>Create a new cake item for the catalog</DialogDescription>
            </DialogHeader>
            <CakeFormFields {...formProps} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAddCake} disabled={submitting}>{submitting ? "Adding..." : "Add Cake"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Manager */}
      <CategoryManager categories={categories} onRefresh={loadCategories} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cakes by name, category, or flavor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cakes Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Flavor</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Flavours</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td></tr>
                ) : filteredCakes.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No cakes found</td></tr>
                ) : (
                  filteredCakes.map((cake) => (
                    <tr key={cake.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{cake.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{cake.category}</td>
                      <td className="px-4 py-3 text-sm">Rs. {cake.price}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{cake.size}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{cake.flavor}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => setFlavourDialogCake(cake)} className="h-8 w-8 p-0 text-accent hover:text-accent" title="Configure flavours">
                          <UtensilsCrossed className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(cake)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCake(cake.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cake</DialogTitle>
            <DialogDescription>Update cake details</DialogDescription>
          </DialogHeader>
          <CakeFormFields {...formProps} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleEditCake} disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flavour Config Dialog */}
      {flavourDialogCake && (
        <FlavourConfigDialog
          open={!!flavourDialogCake}
          onOpenChange={(open) => { if (!open) setFlavourDialogCake(null) }}
          cakeId={flavourDialogCake.id}
          cakeName={flavourDialogCake.name}
        />
      )}
    </div>
  )
}
