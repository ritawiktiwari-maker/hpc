"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatQuantityWithUnit, LOW_STOCK_THRESHOLD } from "@/lib/types"
import type { ProductUnit } from "@/lib/types"
import { Plus, Search, Package, Download, MoreHorizontal, Pencil, Trash2, RefreshCw, History, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { exportStockToExcel } from "@/lib/excel-export"

interface DBProduct {
  id: string
  productId: string
  name: string
  category: string
  quantityAvailable: number
  quantityPurchased: number
  unit: string
  supplierName?: string | null
  dateOfPurchase?: string | null
  remarks?: string | null
  createdAt: string
  updatedAt: string
}

interface DBTransaction {
  id: string
  type: string
  quantity: number
  remarks?: string | null
  createdAt: string
  product: { name: string; productId: string; unit: string }
}

export default function StockPage() {
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState<DBProduct[]>([])
  const [transactions, setTransactions] = useState<DBTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restockOpen, setRestockOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<DBProduct | null>(null)
  const [restockQuantity, setRestockQuantity] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    productId: "", name: "", category: "CHEMICAL" as "CHEMICAL" | "MACHINE", unit: "litres" as ProductUnit,
    quantityAvailable: "", supplierName: "", dateOfPurchase: "", remarks: ""
  })

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, txRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stock/transactions')
      ])
      if (prodRes.ok) setProducts(await prodRes.json())
      if (txRes.ok) setTransactions(await txRes.json())
    } catch (e) {
      toast.error("Failed to load stock data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (isLoggedIn) fetchData() }, [isLoggedIn, fetchData])

  if (!isLoggedIn) return <LoginScreen />

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.productId.toLowerCase().includes(search.toLowerCase())
  )

  // ──────────  Handlers  ──────────

  const handleAdd = () => {
    setIsEditing(false)
    setSelectedProduct(null)
    const nextId = `PRD${String(products.length + 1).padStart(4, '0')}`
    setFormData({ productId: nextId, name: "", category: "CHEMICAL", unit: "litres", quantityAvailable: "", supplierName: "", dateOfPurchase: new Date().toISOString().split('T')[0], remarks: "" })
    setFormOpen(true)
  }

  const handleEdit = (p: DBProduct) => {
    setIsEditing(true)
    setSelectedProduct(p)
    setFormData({
      productId: p.productId,
      name: p.name,
      category: (p.category as "CHEMICAL" | "MACHINE") || "CHEMICAL",
      unit: (p.unit as ProductUnit) || "litres",
      quantityAvailable: String(p.quantityAvailable),
      supplierName: p.supplierName || "",
      dateOfPurchase: p.dateOfPurchase ? new Date(p.dateOfPurchase).toISOString().split('T')[0] : "",
      remarks: p.remarks || ""
    })
    setFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast.error("Product name is required"); return }

    try {
      if (isEditing && selectedProduct) {
        const res = await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name, unit: formData.unit,
            supplierName: formData.supplierName, dateOfPurchase: formData.dateOfPurchase,
            remarks: formData.remarks
          })
        })
        if (!res.ok) throw new Error("Update failed")
        toast.success("Product updated successfully")
      } else {
        if (!formData.quantityAvailable || parseFloat(formData.quantityAvailable) <= 0) {
          toast.error("Quantity must be greater than 0"); return
        }
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: formData.productId, name: formData.name,
            category: formData.category,
            quantityAvailable: parseFloat(formData.quantityAvailable),
            unit: formData.unit, supplierName: formData.supplierName,
            dateOfPurchase: formData.dateOfPurchase, remarks: formData.remarks
          })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.details || "Create failed")
        }
        toast.success("Product added successfully")
      }
      setFormOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleRestockSubmit = async () => {
    if (!selectedProduct) return
    const qty = parseFloat(restockQuantity)
    if (isNaN(qty) || qty <= 0) { toast.error("Please enter a valid quantity"); return }
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restock', quantityAdded: qty })
      })
      if (!res.ok) throw new Error("Restock failed")
      toast.success(`Restocked ${selectedProduct.name} by ${qty} ${selectedProduct.unit}`)
      setRestockOpen(false)
      fetchData()
    } catch (err) { toast.error("Failed to restock") }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Product deleted")
      setDeleteOpen(false)
      fetchData()
    } catch { toast.error("Failed to delete product") }
  }

  const handleClearStock = async () => {
    try {
      const res = await fetch('/api/admin/clear-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      })
      if (!res.ok) throw new Error("Clear failed")
      toast.success("All stock data cleared successfully")
      setClearOpen(false)
      fetchData()
    } catch { toast.error("Failed to clear stock data") }
  }

  const handleExport = () => {
    // Map to the legacy format for the export utility
    const mapped = products.map(p => ({
      id: p.id, productId: p.productId, productName: p.name,
      quantityAvailable: p.quantityAvailable, quantityPurchased: p.quantityPurchased,
      unit: p.unit as ProductUnit, supplierName: p.supplierName || "",
      dateOfPurchase: p.dateOfPurchase || "", remarks: p.remarks || "",
      createdAt: p.createdAt, updatedAt: p.updatedAt
    }))
    exportStockToExcel(mapped as any, [])
    toast.success("Stock exported to Excel")
  }

  const typeColor: Record<string, string> = {
    PURCHASE: "bg-green-100 text-green-700",
    ASSIGN_TO_EMPLOYEE: "bg-orange-100 text-orange-700",
    RETURN_FROM_EMPLOYEE: "bg-blue-100 text-blue-700",
    USED_IN_VISIT: "bg-purple-100 text-purple-700",
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stock Management</h1>
            <p className="text-muted-foreground">Manage your inventory and track history</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current" className="gap-2"><Package className="w-4 h-4" /> Current Stock</TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" /> Stock History ({transactions.length})</TabsTrigger>
          </TabsList>

          {/* Current Stock Tab */}
          <TabsContent value="current">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-base">All Products ({filteredProducts.length})</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground animate-pulse">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No products found. Add your first product.</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Product ID</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Type</TableHead>
                          <TableHead className="hidden sm:table-cell">Unit</TableHead>
                          <TableHead className="hidden md:table-cell">Purchase Date</TableHead>
                          <TableHead className="text-right">Purchased</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map(p => {
                          const isLow = p.quantityAvailable <= LOW_STOCK_THRESHOLD
                          const isOut = p.quantityAvailable === 0
                          const unit = (p.unit || "pieces") as ProductUnit
                          return (
                            <TableRow key={p.id} className={cn(isOut && "bg-destructive/5")}>
                              <TableCell className="font-mono text-sm">{p.productId}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{p.name}</p>
                                  {p.supplierName && <p className="text-xs text-muted-foreground">{p.supplierName}</p>}
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant={p.category === 'MACHINE' ? 'default' : 'secondary'} className="text-[10px]">
                                  {p.category === 'MACHINE' ? 'Machine' : 'Chemical'}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant="outline" className="capitalize">{unit}</Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {p.dateOfPurchase ? format(new Date(p.dateOfPurchase), "dd MMM yyyy") : "—"}
                              </TableCell>
                              <TableCell className="text-right">{formatQuantityWithUnit(p.quantityPurchased || 0, unit)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={isOut ? "destructive" : isLow ? "secondary" : "default"}
                                  className={cn(!isOut && !isLow && "bg-[#7CB342]/10 text-[#7CB342] border-[#7CB342]/20")}>
                                  {formatQuantityWithUnit(p.quantityAvailable, unit)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setSelectedProduct(p); setRestockQuantity(""); setRestockOpen(true) }}>
                                      <Plus className="mr-2 h-4 w-4" /> Restock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(p)}>
                                      <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedProduct(p); setDeleteOpen(true) }} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Stock Transaction History</CardTitle></CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No stock transactions recorded yet.</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="hidden md:table-cell">Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map(tx => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm">{format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                            <TableCell>
                              <p className="font-medium">{tx.product?.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{tx.product?.productId}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-xs", typeColor[tx.type] || "bg-gray-100 text-gray-700")}>
                                {tx.type.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              <span className={cn(tx.quantity > 0 ? "text-green-600" : "text-red-500")}>
                                {tx.quantity > 0 ? "+" : ""}{tx.quantity} {tx.product?.unit}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{tx.remarks || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add / Edit Product Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product ID</Label>
              <Input value={formData.productId} onChange={e => setFormData(p => ({ ...p, productId: e.target.value.toUpperCase() }))} placeholder="PRD0001" disabled={isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v: "CHEMICAL" | "MACHINE") => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHEMICAL">Chemical</SelectItem>
                  <SelectItem value="MACHINE">Machine / Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={formData.dateOfPurchase} onChange={e => setFormData(p => ({ ...p, dateOfPurchase: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select value={formData.unit} onValueChange={(v: ProductUnit) => setFormData(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="litres">Litres</SelectItem>
                    <SelectItem value="ml">Millilitres</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="mg">Milligrams</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" min="0.01" step="0.01" value={formData.quantityAvailable} onChange={e => setFormData(p => ({ ...p, quantityAvailable: e.target.value }))} placeholder="0" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Supplier Name</Label>
              <Input value={formData.supplierName} onChange={e => setFormData(p => ({ ...p, supplierName: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea value={formData.remarks} onChange={e => setFormData(p => ({ ...p, remarks: e.target.value }))} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">{isEditing ? "Update Product" : "Add Product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>Add more stock for <strong>{selectedProduct?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Quantity to Add ({selectedProduct?.unit})</Label>
            <Input type="number" min="0" step="0.01" value={restockQuantity} onChange={e => setRestockQuantity(e.target.value)} placeholder="e.g., 50" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockOpen(false)}>Cancel</Button>
            <Button onClick={handleRestockSubmit}>Confirm Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{selectedProduct?.name}</strong>? This will remove all stock history for this product. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Stock dialog removed per admin request */}
    </AdminLayout>
  )
}
