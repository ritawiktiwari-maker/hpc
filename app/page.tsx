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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const HPC_LOGO_URL = "/images/logo-20hpc.png"

export default function DashboardPage() {
  const { isLoggedIn, settings } = useAuth()
  const [data, setData] = useState<AppData | null>(null)
  const [runningOrders, setRunningOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [dbEmployeeCount, setDbEmployeeCount] = useState<number>(0)
  const [dbProductCount, setDbProductCount] = useState<number>(0)
  const [dbJobCount, setDbJobCount] = useState<number>(0)

  useEffect(() => {
    if (isLoggedIn) {
      setData(getData())
      fetchRunningOrders()
      fetchEmployeeCount()
      fetchProductCount()
      fetchJobCount()
    }
  }, [isLoggedIn])

  const fetchEmployeeCount = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const employees = await response.json()
        setDbEmployeeCount(employees.length)
      }
    } catch (error) {
      console.error("Failed to fetch employee count:", error)
    }
  }

  const fetchProductCount = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const products = await response.json()
        setDbProductCount(products.length)
      }
    } catch (error) {
      console.error("Failed to fetch product count:", error)
    }
  }

  const fetchJobCount = async () => {
    try {
      const response = await fetch("/api/jobs")
      if (response.ok) {
        const jobs = await response.json()
        setDbJobCount(jobs.length)
      }
    } catch (error) {
      console.error("Failed to fetch job count:", error)
    }
  }

  const fetchRunningOrders = async () => {
    try {
      setLoadingOrders(true)
      const response = await fetch("/api/jobs/pending")
      if (response.ok) {
        const orders = await response.json()
        setRunningOrders(orders)
      }
    } catch (error) {
      console.error("Failed to fetch running orders:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

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
          totalEmployees={dbEmployeeCount}
          totalProducts={dbProductCount}
          totalJobs={dbJobCount}
          lowStockCount={lowStockCount}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RunningOrders orders={runningOrders} loading={loadingOrders} />
          <UpcomingServices jobs={data.jobs} />
          <LowStockAlert products={data.products} />
          <div className="lg:col-span-3">
            <ActivityLog activities={data.activities} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function RunningOrders({ orders, loading }: { orders: any[], loading: boolean }) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Running Orders (Pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No running orders at the moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.customerName}
                      <div className="text-xs text-muted-foreground">{order.customerContact}</div>
                    </TableCell>
                    <TableCell className="text-sm">{order.serviceType}</TableCell>
                    <TableCell className="text-sm">{order.employeeName}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.scheduledDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 uppercase text-[10px]">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

