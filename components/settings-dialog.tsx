"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useAuth()
  const [formData, setFormData] = useState(settings)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPG and PNG files are allowed")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, logoUrl: event.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    if (!formData.companyName.trim()) {
      toast.error("Company name is required")
      return
    }
    if (!formData.panelName.trim()) {
      toast.error("Panel name is required")
      return
    }
    if (!formData.adminName.trim()) {
      toast.error("Admin name is required")
      return
    }

    updateSettings(formData)
    toast.success("Settings saved successfully")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Panel Settings</DialogTitle>
          <DialogDescription>Customize your admin panel appearance and information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage src={formData.logoUrl || ""} alt="Logo" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {formData.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                {formData.logoUrl && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo}>
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
              placeholder="Enter company name"
            />
          </div>

          {/* Panel Name */}
          <div className="space-y-2">
            <Label htmlFor="panelName">Panel Name</Label>
            <Input
              id="panelName"
              value={formData.panelName}
              onChange={(e) => setFormData((prev) => ({ ...prev, panelName: e.target.value }))}
              placeholder="Enter panel name"
            />
          </div>

          {/* Admin Name */}
          <div className="space-y-2">
            <Label htmlFor="adminName">Admin Name</Label>
            <Input
              id="adminName"
              value={formData.adminName}
              onChange={(e) => setFormData((prev) => ({ ...prev, adminName: e.target.value }))}
              placeholder="Enter admin name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
