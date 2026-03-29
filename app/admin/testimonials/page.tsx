"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Star, Quote } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Testimonial {
  id: string
  name: string
  location: string | null
  rating: number
  text: string
  service: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminTestimonialsPage() {
  const { isLoggedIn } = useAuth()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: "", location: "", rating: 5, text: "", service: "", isActive: true
  })

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) setTestimonials(await res.json())
    } catch { } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (isLoggedIn) fetchTestimonials() }, [isLoggedIn, fetchTestimonials])

  if (!isLoggedIn) return <LoginScreen />

  const handleAdd = () => {
    setSelected(null)
    setFormData({ name: "", location: "", rating: 5, text: "", service: "", isActive: true })
    setFormOpen(true)
  }

  const handleEdit = (t: Testimonial) => {
    setSelected(t)
    setFormData({
      name: t.name, location: t.location || "", rating: t.rating,
      text: t.text, service: t.service || "", isActive: t.isActive
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.text) {
      toast.error("Name and review text are required"); return
    }
    try {
      const url = selected ? `/api/testimonials/${selected.id}` : '/api/testimonials'
      const method = selected ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(selected ? "Testimonial updated" : "Testimonial added")
      setFormOpen(false)
      fetchTestimonials()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      await fetch(`/api/testimonials/${selected.id}`, { method: 'DELETE' })
      toast.success("Testimonial deleted")
      setDeleteOpen(false)
      fetchTestimonials()
    } catch { toast.error("Failed to delete") }
  }

  const handleToggleActive = async (t: Testimonial) => {
    try {
      await fetch(`/api/testimonials/${t.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !t.isActive })
      })
      fetchTestimonials()
    } catch { toast.error("Failed to update") }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500" /> Testimonials
            </h1>
            <p className="text-muted-foreground">Manage customer reviews displayed on your website</p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Testimonial
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <Card className="col-span-2"><CardContent className="py-12 text-center text-muted-foreground">No testimonials yet.</CardContent></Card>
          ) : (
            testimonials.map((t, idx) => (
              <Card key={t.id} className={`transition-opacity ${!t.isActive ? 'opacity-50' : ''} animate-fade-in hover-lift`} style={{ animationDelay: `${idx * 60}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.location || "Ranchi"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={t.isActive} onCheckedChange={() => handleToggleActive(t)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelected(t); setDeleteOpen(true) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {renderStars(t.rating)}

                  <div className="mt-3 relative">
                    <Quote className="absolute -top-1 -left-1 h-4 w-4 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground pl-4 line-clamp-3">{t.text}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {t.service && <Badge variant="outline" className="text-[10px]">{t.service}</Badge>}
                    <span className="text-[10px] text-muted-foreground">{format(new Date(t.createdAt), "dd MMM yyyy")}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="Ranchi" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={String(formData.rating)} onValueChange={v => setFormData(p => ({ ...p, rating: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map(r => (
                      <SelectItem key={r} value={String(r)}>{"★".repeat(r)}{"☆".repeat(5 - r)} ({r})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service Used</Label>
                <Input value={formData.service} onChange={e => setFormData(p => ({ ...p, service: e.target.value }))} placeholder="e.g. Termite Control" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Review Text *</Label>
              <Textarea value={formData.text} onChange={e => setFormData(p => ({ ...p, text: e.target.value }))} rows={4} placeholder="Customer's review..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={v => setFormData(p => ({ ...p, isActive: v }))} />
              <Label>Show on website</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{selected ? "Update" : "Add"} Testimonial</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Delete review by "{selected?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
