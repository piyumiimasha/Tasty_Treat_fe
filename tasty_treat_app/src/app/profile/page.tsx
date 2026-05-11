"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getUserInfo, getUserProfile, updateUserProfile, setAuthData, getAuthToken, type UserProfileDto } from "@/lib/api/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, Star, Pencil, Trash2, MessageSquare } from "lucide-react"
import { ReviewDto, getCustomerReviews, updateReview, deleteReview } from "@/lib/api/reviews"
import { getItemById } from "@/lib/api/items"

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-4 h-4"
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${cls} ${i < rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star className={`w-7 h-7 transition-colors ${star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    password: "",
    confirmPassword: "",
  })

  const [reviews, setReviews] = useState<ReviewDto[]>([])
  const [itemNames, setItemNames] = useState<Record<number, string>>({})
  const [editTarget, setEditTarget] = useState<ReviewDto | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")
  const [savingReview, setSavingReview] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const info = getUserInfo()
    if (!info) {
      router.push("/login")
      return
    }
    getUserProfile(info.userId)
      .then((data) => {
        setProfile(data)
        setForm((f) => ({
          ...f,
          name: data.name,
          email: data.email,
          phoneNo: data.phoneNo ?? "",
          address: data.address ?? "",
        }))
      })
      .catch(() => toast({ title: "Error", description: "Could not load profile.", variant: "destructive" }))
      .finally(() => setLoading(false))

    getCustomerReviews(info.userId)
      .then(async (data) => {
        setReviews(data.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()))
        const uniqueItemIds = [...new Set(data.map((r) => r.itemId))]
        const entries = await Promise.all(
          uniqueItemIds.map(async (id) => {
            try { const item = await getItemById(id); return [id, item.name] as [number, string] }
            catch { return [id, `Item #${id}`] as [number, string] }
          })
        )
        setItemNames(Object.fromEntries(entries))
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (review: ReviewDto) => {
    setEditTarget(review)
    setEditRating(review.rating)
    setEditComment(review.comment ?? "")
  }

  const submitEdit = async () => {
    if (!editTarget || editRating === 0) return
    setSavingReview(true)
    try {
      const updated = await updateReview(editTarget.reviewId, { rating: editRating, comment: editComment.trim() || undefined })
      setReviews((prev) => prev.map((r) => r.reviewId === updated.reviewId ? updated : r))
      setEditTarget(null)
      toast({ title: "Review updated" })
    } catch {
      toast({ title: "Error", description: "Failed to update review.", variant: "destructive" })
    } finally {
      setSavingReview(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    setDeletingId(reviewId)
    try {
      await deleteReview(reviewId)
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId))
      toast({ title: "Review deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }
    if (!profile) return

    setSaving(true)
    try {
      const payload: Record<string, string> = {}
      if (form.name !== profile.name) payload.name = form.name
      if (form.email !== profile.email) payload.email = form.email
      if (form.phoneNo !== (profile.phoneNo ?? "")) payload.phoneNo = form.phoneNo
      if (form.address !== (profile.address ?? "")) payload.address = form.address
      if (form.password) payload.password = form.password

      if (Object.keys(payload).length === 0) {
        toast({ title: "No changes to save" })
        return
      }

      const updated = await updateUserProfile(profile.userId, payload)
      setProfile(updated)
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }))

      // Sync name/email back to localStorage so the nav updates
      const token = getAuthToken()!
      setAuthData({ token, userId: updated.userId, email: updated.email, name: updated.name, role: updated.role })

      toast({ title: "Profile updated", description: "Your changes have been saved." })
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message ?? "Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details</p>
      </div>

      {/* Avatar + member since */}
      <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl border border-border bg-card">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary">
            {profile?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{profile?.name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          {profile?.createdAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <Card className="border border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-sm">
                <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone Number
              </Label>
              <Input
                id="phone"
                value={form.phoneNo}
                onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
                placeholder="+94 77 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Address
              </Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Your delivery address"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Change Password
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 h-11"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* My Reviews */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            My Reviews
            {reviews.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't reviewed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.reviewId} className="rounded-xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {itemNames[review.itemId] ?? `Item #${review.itemId}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarDisplay rating={review.rating} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(review)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(review.reviewId)}
                        disabled={deletingId === review.reviewId}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                      >
                        {deletingId === review.reviewId
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit review dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editTarget && (
              <p className="text-sm text-muted-foreground">
                {itemNames[editTarget.itemId] ?? `Item #${editTarget.itemId}`}
              </p>
            )}
            <StarPicker value={editRating} onChange={setEditRating} />
            <Textarea
              placeholder="Your comment (optional)..."
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={savingReview}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={editRating === 0 || savingReview}>
              {savingReview ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
