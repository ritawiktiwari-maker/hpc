"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Pencil, Trash2, GripVertical, Globe, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Service {
  id: string
  slug: string
  name: string
  shortDesc: string
  description: string
  icon: string | null
  features: string[]
  isActive: boolean
  sortOrder: number
}

export default function AdminServicesPage() {
  const { isLoggedIn } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "", slug: "", shortDesc: "", description: "", icon: "", features: "", isActive: true, sortOrder: 0
  })

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) setServices(await res.json())
    } catch { } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (isLoggedIn) fetchServices() }, [isLoggedIn, fetchServices])

  if (!isLoggedIn) return <LoginScreen />

  const handleAdd = () => {
    setSelected(null)
    setFormData({ name: "", slug: "", shortDesc: "", description: "", icon: "", features: "", isActive: true, sortOrder: services.length })
    setFormOpen(true)
  }

  const handleEdit = (s: Service) => {
    setSelected(s)
    setFormData({
      name: s.name, slug: s.slug, shortDesc: s.shortDesc, description: s.description,
      icon: s.icon || "", features: s.features.join("\n"), isActive: s.isActive, sortOrder: s.sortOrder
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.shortDesc) {
      toast.error("Name and short description are required"); return
    }
    const payload = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      features: formData.features.split("\n").map(f => f.trim()).filter(Boolean),
    }
    try {
      const url = selected ? `/api/services/${selected.id}` : '/api/services'
      const method = selected ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(selected ? "Service updated" : "Service created")
      setFormOpen(false)
      fetchServices()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      const res = await fetch(`/api/services/${selected.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success("Service deleted")
      setDeleteOpen(false)
      fetchServices()
    } catch { toast.error("Failed to delete") }
  }

  const handleToggleActive = async (s: Service) => {
    try {
      await fetch(`/api/services/${s.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !s.isActive })
      })
      fetchServices()
    } catch { toast.error("Failed to update") }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6" /> Website Services
            </h1>
            <p className="text-muted-foreground">Manage services displayed on your public website</p>
          </div>
          <div className="flex gap-2">
            <Link href="/services" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" /> View Website
              </Button>
            </Link>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Service
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading services...</div>
          ) : services.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No services yet. Add your first service.</CardContent></Card>
          ) : (
            services.map((s, idx) => (
              <Card key={s.id} className={`transition-opacity ${!s.isActive ? 'opacity-50' : ''} animate-fade-in`} style={{ animationDelay: `${idx * 50}ms` }}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl w-10 text-center text-muted-foreground">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{s.name}</h3>
                      {!s.isActive && <Badge variant="secondary">Hidden</Badge>}
                      <Badge variant="outline" className="text-[10px]">/{s.slug}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{s.shortDesc}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {s.features.slice(0, 3).map((f, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
                      ))}
                      {s.features.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{s.features.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={s.isActive} onCheckedChange={() => handleToggleActive(s)} />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setSelected(s); setDeleteOpen(true) }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Termite Management Solutions" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug (URL path)</Label>
                <Input value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" />
              </div>
              <div className="space-y-2">
                <Label>Icon (Lucide name)</Label>
                <Input value={formData.icon} onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. Bug, Shield" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Short Description *</Label>
              <Input value={formData.shortDesc} onChange={e => setFormData(p => ({ ...p, shortDesc: e.target.value }))} placeholder="One-liner for cards" />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Detailed description for the service page..." />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea value={formData.features} onChange={e => setFormData(p => ({ ...p, features: e.target.value }))} rows={5} placeholder={"Pre & Post Construction Treatment\n5-10 Year Warranty\nCertified Chemicals"} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={v => setFormData(p => ({ ...p, isActive: v }))} />
              <Label>Active (visible on website)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{selected ? "Update" : "Create"} Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{selected?.name}"? This will remove it from your website.
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
