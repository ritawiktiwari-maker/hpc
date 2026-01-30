"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Product, LOW_STOCK_THRESHOLD } from "@/lib/types"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockProducts = products.filter((p) => p.quantityAvailable <= LOW_STOCK_THRESHOLD)

  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">All products are well stocked</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          Low Stock Alerts ({lowStockProducts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lowStockProducts.slice(0, 5).map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
            <div>
              <p className="text-sm font-medium">{product.productName}</p>
              <p className="text-xs text-muted-foreground">{product.productId}</p>
            </div>
            <Badge variant={product.quantityAvailable === 0 ? "destructive" : "secondary"}>
              {product.quantityAvailable} left
            </Badge>
          </div>
        ))}
        {lowStockProducts.length > 5 && (
          <Link href="/stock">
            <Button variant="link" size="sm" className="w-full">
              View all {lowStockProducts.length} low stock items
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
