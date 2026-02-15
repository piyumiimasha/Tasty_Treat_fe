"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { getAllItems, createItem, updateItem, deleteItem } from "@/lib/api/items"
import { mapItemToCake, mapCakeToCreateItem, mapCakeToUpdateItem, Cake } from "@/lib/mappers/item-mapper"

const CATEGORIES = ["Wedding Cakes", "Birthday Cakes", "Cupcakes", "Desserts", "Custom Designs"]

export default function CakeManagement() {
  const [cakes, setCakes] = useState<Cake[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCake, setEditingCake] = useState<Cake | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Wedding Cakes",
    price: 0,
    size: "",
    flavor: "",
    images: "",
  })

  // Load cakes on mount
  useEffect(() => {
    loadCakes()
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      const items = await getAllItems()
      const cakeData = items.map(mapItemToCake)
      setCakes(cakeData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cakes. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load cakes:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Wedding Cakes",
      price: 0,
      size: "",
      flavor: "",
      images: "",
    })
  }

  const handleAddCake = async () => {
    if (!formData.name || !formData.flavor || !formData.size) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const newCake: Omit<Cake, "id"> = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        size: formData.size,
        flavor: formData.flavor,
        rating: 4.5,
        images: formData.images ? formData.images.split(",").map((img) => img.trim()) : [],
        videos: [],
      }

      const createDto = mapCakeToCreateItem(newCake)
      await createItem(createDto)

      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Cake added successfully",
      })

      // Reload cakes from backend
      await loadCakes()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cake. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to add cake:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCake = async () => {
    if (!editingCake || !formData.name || !formData.flavor || !formData.size) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const updatedCake: Partial<Cake> = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        size: formData.size,
        flavor: formData.flavor,
        images: formData.images ? formData.images.split(",").map((img) => img.trim()) : editingCake.images,
      }

      const updateDto = mapCakeToUpdateItem(updatedCake)
      await updateItem(editingCake.id, updateDto)

      setIsEditDialogOpen(false)
      setEditingCake(null)
      resetForm()
      toast({
        title: "Success",
        description: "Cake updated successfully",
      })

      // Reload cakes from backend
      await loadCakes()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cake. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to update cake:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCake = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cake?")) {
      return
    }

    try {
      await deleteItem(id)
      toast({
        title: "Success",
        description: "Cake deleted successfully",
      })

      // Reload cakes from backend
      await loadCakes()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete cake. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to delete cake:", error)
    }
  }

  const openEditDialog = (cake: Cake) => {
    setEditingCake(cake)
    setFormData({
      name: cake.name,
      category: cake.category,
      price: cake.price,
      size: cake.size,
      flavor: cake.flavor,
      images: cake.images.join(", "),
    })
    setIsEditDialogOpen(true)
  }

  const filteredCakes = cakes.filter(
    (cake) =>
      cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cake.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cake.flavor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CakeFormFields = () => (
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
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
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
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Textarea
          id="images"
          placeholder="/image1.jpg, /image2.jpg"
          rows={3}
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
        />
      </div>
    </div>
  )

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
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Cake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Cake</DialogTitle>
              <DialogDescription>Create a new cake item for the catalog</DialogDescription>
            </DialogHeader>
            <CakeFormFields />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleAddCake} disabled={submitting}>
                {submitting ? "Adding..." : "Add Cake"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredCakes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No cakes found
                    </td>
                  </tr>
                ) : (
                  filteredCakes.map((cake) => (
                    <tr key={cake.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{cake.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{cake.category}</td>
                      <td className="px-4 py-3 text-sm">Rs. {cake.price}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{cake.size}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{cake.flavor}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(cake)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCake(cake.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
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
          <CakeFormFields />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditCake} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
