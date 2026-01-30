"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Employee } from "@/lib/types"
import {
  validateAadhaar,
  validateMobile,
  validateEmployeeId,
  validateImageFile,
  formatAadhaar,
  formatMobile,
} from "@/lib/validations"
import { generateEmployeeId } from "@/lib/data-store"
import { toast } from "sonner"
import { Camera, X } from "lucide-react"
import Image from "next/image"

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  existingEmployees: Employee[]
  onSubmit: (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) => void
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  existingEmployees,
  onSubmit,
}: EmployeeFormDialogProps) {
  const isEditing = !!employee

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    fatherName: "",
    aadhaarNumber: "",
    dateOfBirth: "",
    mobileNumber: "",
    emergencyContact: "",
    address: "",
    photo: null as string | null,
    dateOfJoining: "",
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (employee) {
        setFormData({
          employeeId: employee.employeeId,
          name: employee.name,
          fatherName: employee.fatherName,
          aadhaarNumber: employee.aadhaarNumber,
          dateOfBirth: employee.dateOfBirth,
          mobileNumber: employee.mobileNumber,
          emergencyContact: employee.emergencyContact,
          address: employee.address,
          photo: employee.photo,
          dateOfJoining: employee.dateOfJoining,
          password: employee.password || "", // Add password
        })
      } else {
        setFormData({
          employeeId: generateEmployeeId(existingEmployees),
          name: "",
          fatherName: "",
          aadhaarNumber: "",
          dateOfBirth: "",
          mobileNumber: "",
          emergencyContact: "",
          address: "",
          photo: null,
          dateOfJoining: new Date().toISOString().split("T")[0],
          password: "password123", // Default password
        })
      }
      setErrors({})
    }
  }, [open, employee, existingEmployees])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) {
      toast.error("Please upload a JPG or PNG image")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required"
    if (!validateAadhaar(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Aadhaar must be 12 digits"
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!validateMobile(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile must be 10 digits"
    }
    if (!validateMobile(formData.emergencyContact)) {
      newErrors.emergencyContact = "Emergency contact must be 10 digits"
    }
    if (!formData.address.trim()) newErrors.address = "Address is required"

    const existingIds = existingEmployees.map((e) => e.employeeId)
    if (!validateEmployeeId(formData.employeeId, existingIds, employee?.employeeId)) {
      newErrors.employeeId = "Employee ID must be unique"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                {formData.photo ? (
                  <Image src={formData.photo || "/placeholder.svg"} alt="Employee" fill className="object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {formData.photo && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, photo: null }))}
                  className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value.toUpperCase() }))}
                placeholder="EMP0001"
              />
              {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">Father&apos;s Name *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fatherName: e.target.value }))}
                placeholder="Enter father's name"
              />
              {errors.fatherName && <p className="text-xs text-destructive">{errors.fatherName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
              <Input
                id="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, aadhaarNumber: formatAadhaar(e.target.value) }))}
                placeholder="12 digit Aadhaar number"
                maxLength={12}
              />
              {errors.aadhaarNumber && <p className="text-xs text-destructive">{errors.aadhaarNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              />
              {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining</Label>
              <Input
                id="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfJoining: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, mobileNumber: formatMobile(e.target.value) }))}
                placeholder="10 digit mobile number"
                maxLength={10}
              />
              {errors.mobileNumber && <p className="text-xs text-destructive">{errors.mobileNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact *</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: formatMobile(e.target.value) }))}
                placeholder="10 digit emergency contact"
                maxLength={10}
              />
              {errors.emergencyContact && <p className="text-xs text-destructive">{errors.emergencyContact}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Login Password *</Label>
              <Input
                id="password"
                type="text" // Visible for admin to set
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Set login password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Enter full address"
              rows={3}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update Employee" : "Add Employee"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
