"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { UpcomingServices } from "@/components/dashboard/upcoming-services"
import { type AppData, LOW_STOCK_THRESHOLD } from "@/lib/types"
import { getData } from "@/lib/data-store"

const HPC_LOGO_URL = "/images/logo-20hpc.png"

export default function DashboardPage() {
  const { isLoggedIn, settings } = useAuth()
  const [data, setData] = useState<AppData | null>(null)

  useEffect(() => {
    if (isLoggedIn) {
      setData(getData())
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <LoginScreen />
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

  const lowStockCount = data.products.filter((p) => p.quantityAvailable <= LOW_STOCK_THRESHOLD).length
  const logoUrl = settings.logoUrl || HPC_LOGO_URL

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white shadow border border-border/50 p-2 flex items-center justify-center">
            <img src={logoUrl || "/placeholder.svg"} alt="HPC Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hello {settings.adminName},</h1>
            <p className="text-muted-foreground">
              Welcome to {settings.companyName} {settings.panelName}
            </p>
          </div>
        </div>

        <StatsCards
          totalEmployees={data.employees.length}
          totalProducts={data.products.length}
          totalJobs={data.jobs.length}
          lowStockCount={lowStockCount}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UpcomingServices jobs={data.jobs} />
          <LowStockAlert products={data.products} />
          <ActivityLog activities={data.activities} />
        </div>
      </div>
    </AdminLayout>
  )
}
