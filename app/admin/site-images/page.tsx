"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus, Pencil, Trash2, ImageIcon, Upload, Eye, EyeOff, ExternalLink, X,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

const SECTIONS = [
  { value: "HERO", label: "Hero Section" },
  { value: "ABOUT", label: "About Page" },
  { value: "SERVICES", label: "Services" },
  { value: "GALLERY", label: "Gallery / Work" },
  { value: "GENERAL", label: "General" },
]

const sectionColors: Record<string, string> = {
  HERO: "bg-blue-100 text-blue-700",
  ABOUT: "bg-green-100 text-green-700",
  SERVICES: "bg-purple-100 text-purple-700",
  GALLERY: "bg-orange-100 text-orange-700",
  GENERAL: "bg-gray-100 text-gray-700",
}

interface SiteImage {
  id: string
  key: string
  title: string
  alt: string | null
  section: string
  imageData: string
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export default function AdminSiteImagesPage() {
  const { isLoggedIn } = useAuth()
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<SiteImage | null>(null)
  const [selected, setSelected] = useState<SiteImage | null>(null)
  const [filterSection, setFilterSection] = useState<string>("ALL")
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    key: "",
    title: "",
    alt: "",
    section: "HERO",
    imageData: "",
    isActive: true,
    sortOrder: 0,
  })

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/site-images?all=1")
      if (res.ok) setImages(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchImages()
  }, [isLoggedIn, fetchImages])

  if (!isLoggedIn) return <LoginScreen />

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((p) => ({ ...p, imageData: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    setSelected(null)
    setFormData({
      key: "",
      title: "",
      alt: "",
      section: "HERO",
      imageData: "",
      isActive: true,
      sortOrder: images.length,
    })
    setFormOpen(true)
  }

  const handleEdit = (img: SiteImage) => {
    setSelected(img)
    setFormData({
      key: img.key,
      title: img.title,
      alt: img.alt || "",
      section: img.section,
      imageData: img.imageData,
      isActive: img.isActive,
      sortOrder: img.sortOrder,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.imageData) {
      toast.error("Title and image are required")
      return
    }

    setSubmitting(true)
    const payload = {
      ...formData,
      key:
        formData.key ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
    }

    try {
      const url = selected ? `/api/site-images/${selected.id}` : "/api/site-images"
      const method = selected ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      toast.success(selected ? "Image updated" : "Image uploaded")
      setFormOpen(false)
      fetchImages()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      const res = await fetch(`/api/site-images/${selected.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Image deleted")
      setDeleteOpen(false)
      fetchImages()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleToggleActive = async (img: SiteImage) => {
    try {
      await fetch(`/api/site-images/${img.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !img.isActive }),
      })
      fetchImages()
    } catch {
      toast.error("Failed to update")
    }
  }

  const filtered =
    filterSection === "ALL"
      ? images
      : images.filter((i) => i.section === filterSection)

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="h-6 w-6" /> Website Images
            </h1>
            <p className="text-muted-foreground">
              Manage images displayed across your public website
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" /> View Website
              </Button>
            </Link>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Upload Image
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterSection === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterSection("ALL")}
          >
            All ({images.length})
          </Button>
          {SECTIONS.map((s) => {
            const count = images.filter((i) => i.section === s.value).length
            return (
              <Button
                key={s.value}
                variant={filterSection === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSection(s.value)}
              >
                {s.label} ({count})
              </Button>
            )
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl skeleton-loading" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No images yet</p>
              <p className="text-sm">Upload your first image to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((img, idx) => (
              <Card
                key={img.id}
                className={`overflow-hidden transition-opacity ${
                  !img.isActive ? "opacity-50" : ""
                } animate-fade-in`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div
                  className="relative h-40 bg-gray-100 cursor-pointer group"
                  onClick={() => {
                    setPreviewImage(img)
                    setPreviewOpen(true)
                  }}
                >
                  <img
                    src={img.imageData}
                    alt={img.alt || img.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {!img.isActive && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-[10px]">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Hidden
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{img.title}</h3>
                    <Badge
                      className={`text-[10px] shrink-0 ${
                        sectionColors[img.section] || ""
                      }`}
                    >
                      {img.section}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2 truncate">
                    Key: {img.key}
                  </p>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={img.isActive}
                      onCheckedChange={() => handleToggleActive(img)}
                      className="scale-75"
                    />
                    <span className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(img)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        setSelected(img)
                        setDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected ? "Edit Image" : "Upload New Image"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload Area */}
            <div className="space-y-2">
              <Label>Image *</Label>
              {formData.imageData ? (
                <div className="relative rounded-xl overflow-hidden border bg-gray-50">
                  <img
                    src={formData.imageData}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => setFormData((p) => ({ ...p, imageData: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              {formData.imageData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" /> Replace Image
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Hero Background, Team Photo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Key (URL-safe ID)</Label>
                <Input
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, key: e.target.value }))
                  }
                  placeholder="auto-generated"
                />
              </div>
              <div className="space-y-2">
                <Label>Section *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, section: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={formData.alt}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, alt: e.target.value }))
                }
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) =>
                  setFormData((p) => ({ ...p, isActive: v }))
                }
              />
              <Label>Active (visible on website)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "Saving..."
                : selected
                ? "Update Image"
                : "Upload Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewImage && (
            <>
              <img
                src={previewImage.imageData}
                alt={previewImage.alt || previewImage.title}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-4">
                <h3 className="font-bold">{previewImage.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Section: {previewImage.section} &middot; Key: {previewImage.key}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{selected?.title}&rdquo;? This will remove it from
              your website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
