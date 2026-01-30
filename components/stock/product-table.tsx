"use client"

import { type Product, type Job, LOW_STOCK_THRESHOLD, formatQuantityWithUnit } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ProductTableProps {
  products: Product[]
  jobs: Job[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onRestock: (product: Product) => void
}

export function ProductTable({ products, jobs, onEdit, onDelete, onRestock }: ProductTableProps) {
  // Calculate total assigned for each product
  const getAssignedQuantity = (productId: string): number => {
    return jobs.reduce((total, job) => {
      const assignment = job.productsAssigned.find((a) => a.productId === productId)
      return total + (assignment?.quantityGiven || 0)
    }, 0)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products found. Add your first product to get started.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Product ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="hidden sm:table-cell">Unit</TableHead>
            <TableHead className="hidden md:table-cell">Purchase Date</TableHead>
            <TableHead className="text-right">Purchased</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Assigned</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const assigned = getAssignedQuantity(product.productId)
            const isLowStock = product.quantityAvailable <= LOW_STOCK_THRESHOLD
            const isOutOfStock = product.quantityAvailable === 0
            const unit = product.unit || "pieces"

            return (
              <TableRow key={product.id} className={cn(isOutOfStock && "bg-destructive/5")}>
                <TableCell className="font-mono text-sm">{product.productId}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    {product.supplierName && <p className="text-xs text-muted-foreground">{product.supplierName}</p>}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="capitalize">
                    {unit}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(product.dateOfPurchase), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">{formatQuantityWithUnit(product.quantityPurchased, unit)}</TableCell>
                <TableCell className="text-right hidden sm:table-cell">
                  {formatQuantityWithUnit(assigned, unit)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}
                    className={cn(!isOutOfStock && !isLowStock && "bg-[#7CB342]/10 text-[#7CB342] border-[#7CB342]/20")}
                  >
                    {formatQuantityWithUnit(product.quantityAvailable, unit)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onRestock(product)}>
                        <Plus className="mr-2 h-4 w-4" /> Restock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(product)} className="text-destructive">
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
  )
}
