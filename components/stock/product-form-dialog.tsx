"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, ProductUnit } from "@/lib/types"
import { generateProductId } from "@/lib/data-store"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  existingProducts: Product[]
  onSubmit: (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "quantityAvailable">) => void
}

export function ProductFormDialog({ open, onOpenChange, product, existingProducts, onSubmit }: ProductFormDialogProps) {
  const isEditing = !!product

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    dateOfPurchase: "",
    quantityPurchased: 0,
    unit: "litres" as ProductUnit,
    supplierName: "",
    remarks: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          productId: product.productId,
          productName: product.productName,
          dateOfPurchase: product.dateOfPurchase,
          quantityPurchased: product.quantityPurchased,
          unit: product.unit || "litres",
          supplierName: product.supplierName,
          remarks: product.remarks,
        })
      } else {
        setFormData({
          productId: generateProductId(existingProducts),
          productName: "",
          dateOfPurchase: new Date().toISOString().split("T")[0],
          quantityPurchased: 0,
          unit: "litres",
          supplierName: "",
          remarks: "",
        })
      }
      setErrors({})
    }
  }, [open, product, existingProducts])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.productName.trim()) newErrors.productName = "Product name is required"
    if (!formData.dateOfPurchase) newErrors.dateOfPurchase = "Purchase date is required"
    if (formData.quantityPurchased <= 0) newErrors.quantityPurchased = "Quantity must be greater than 0"

    const isDuplicate = existingProducts.some(
      (p) => p.productId === formData.productId && p.productId !== product?.productId,
    )
    if (isDuplicate) newErrors.productId = "Product ID must be unique"

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value.toUpperCase() }))}
              placeholder="PRD0001"
            />
            {errors.productId && <p className="text-xs text-destructive">{errors.productId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
              placeholder="Enter product name"
            />
            {errors.productName && <p className="text-xs text-destructive">{errors.productName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfPurchase">Date of Purchase *</Label>
              <Input
                id="dateOfPurchase"
                type="date"
                value={formData.dateOfPurchase}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfPurchase: e.target.value }))}
              />
              {errors.dateOfPurchase && <p className="text-xs text-destructive">{errors.dateOfPurchase}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value: ProductUnit) => setFormData((prev) => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="litres">Litres (L)</SelectItem>
                  <SelectItem value="ml">Millilitres (ml)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="mg">Milligrams (mg)</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantityPurchased">Quantity ({formData.unit}) *</Label>
            <Input
              id="quantityPurchased"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantityPurchased || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quantityPurchased: Number.parseFloat(e.target.value) || 0 }))
              }
              placeholder="0"
            />
            {errors.quantityPurchased && <p className="text-xs text-destructive">{errors.quantityPurchased}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => setFormData((prev) => ({ ...prev, supplierName: e.target.value }))}
              placeholder="Enter supplier name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update Product" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
