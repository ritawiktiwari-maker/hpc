"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, ClipboardList, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatsCardsProps {
  totalEmployees: number
  totalProducts: number
  totalJobs: number
  lowStockCount: number
}

export function StatsCards({ totalEmployees, totalProducts, totalJobs, lowStockCount }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/employees",
    },
    {
      label: "Products in Stock",
      value: totalProducts,
      icon: Package,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/stock",
    },
    {
      label: "Assigned Jobs",
      value: totalJobs,
      icon: ClipboardList,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      href: "/jobs",
    },
    {
      label: "Low Stock Alerts",
      value: lowStockCount,
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "text-destructive" : "text-muted-foreground",
      bgColor: lowStockCount > 0 ? "bg-destructive/10" : "bg-muted",
      href: "/stock",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href}>
          <Card className="border-border/50 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
