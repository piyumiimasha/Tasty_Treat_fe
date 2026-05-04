"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getUserInfo, getUserProfile, updateUserProfile, setAuthData, getAuthToken, type UserProfileDto } from "@/lib/api/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, Lock, Save, Loader2 } from "lucide-react"

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

      <Card className="border border-border">
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
    </div>
  )
}
