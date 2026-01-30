"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductTable } from "@/components/stock/product-table"
import { ProductFormDialog } from "@/components/stock/product-form-dialog"
import type { AppData, Product } from "@/lib/types"
import { getData, saveData, addProduct, updateProduct, deleteProduct } from "@/lib/data-store"
import { exportStockToExcel } from "@/lib/excel-export"
import { Plus, Search, Package, Download } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"
import { restockProduct } from "@/lib/data-store"

export default function StockPage() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<AppData | null>(null)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restockOpen, setRestockOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [restockQuantity, setRestockQuantity] = useState("")

  useEffect(() => {
    if (isLoggedIn) {
      setData(getData())
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const filteredProducts =
    data?.products.filter(
      (prod) =>
        prod.productName.toLowerCase().includes(search.toLowerCase()) ||
        prod.productId.toLowerCase().includes(search.toLowerCase()),
    ) || []

  // Filter activities for Stock History
  const stockHistory = data?.activities.filter(a =>
    ['product_added', 'product_updated', 'product_deleted', 'stock_restocked', 'stock_return_approved', 'job_assigned'].includes(a.type)
  ) || []

  const handleAdd = () => {
    setSelectedProduct(null)
    setFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  const handleRestockClick = (product: Product) => {
    setSelectedProduct(product)
    setRestockQuantity("")
    setRestockOpen(true)
  }

  const handleRestockSubmit = () => {
    if (!data || !selectedProduct) return
    const qty = parseFloat(restockQuantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    const updated = restockProduct(data, selectedProduct.id, qty)
    saveData(updated)
    setData(updated)
    setRestockOpen(false)
    setSelectedProduct(null)
    toast.success("Stock restocked successfully")
  }

  const handleFormSubmit = (productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "quantityAvailable">) => {
    if (!data) return

    let updated: AppData
    if (selectedProduct) {
      // If editing, we keep the existing quantityAvailable and calculate difference if needed?
      // Actually `updateProduct` replaces fields. 
      // If user changes `quantityPurchased` in Edit, we might need logic. 
      // Current `updateProduct` logic in this page:
      const quantityDiff = productData.quantityPurchased - selectedProduct.quantityPurchased
      const newQuantityAvailable = Math.max(0, selectedProduct.quantityAvailable + quantityDiff)

      updated = updateProduct(data, selectedProduct.id, {
        ...productData,
        quantityAvailable: newQuantityAvailable,
      })
      toast.success("Product updated successfully")
    } else {
      updated = addProduct(data, productData)
      toast.success("Product added successfully")
    }

    saveData(updated)
    setData(updated)
  }

  const handleDeleteConfirm = () => {
    if (!data || !selectedProduct) return

    const updated = deleteProduct(data, selectedProduct.id)
    saveData(updated)
    setData(updated)
    setDeleteOpen(false)
    setSelectedProduct(null)
    toast.success("Product deleted successfully")
  }

  const handleExport = () => {
    if (!data) return
    exportStockToExcel(data.products, data.jobs)
    toast.success("Stock report downloaded successfully")
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stock Management</h1>
            <p className="text-muted-foreground">Manage your inventory and track history</p>
          </div>
          <div className="flex gap-2">
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
            <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" /> Stock History</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    All Products ({data.products.length})
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProductTable
                  products={filteredProducts}
                  jobs={data.jobs}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onRestock={handleRestockClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Stock Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full pr-4">
                  <div className="space-y-4">
                    {stockHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No stock activity recorded yet.</div>
                    ) : (
                      stockHistory.map((activity) => (
                        <div key={activity.id} className="flex gap-4 items-start border-b pb-4 last:border-0">
                          <div className="bg-muted p-2 rounded-full mt-1">
                            {activity.type === 'stock_restocked' ? <RefreshCw className="w-4 h-4 text-green-600" /> :
                              activity.type === 'product_added' ? <Plus className="w-4 h-4" /> :
                                activity.type === 'job_assigned' ? <Package className="w-4 h-4 text-orange-500" /> :
                                  <History className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {activity.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={selectedProduct}
        existingProducts={data.products}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProduct?.productName} ({selectedProduct?.productId})? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>
              Add more stock for {selectedProduct?.productName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quantity to Add ({selectedProduct?.unit})</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockOpen(false)}>Cancel</Button>
            <Button onClick={handleRestockSubmit}>Confirm Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
