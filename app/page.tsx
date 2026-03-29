"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { type AppData } from "@/lib/types"
import { getData } from "@/lib/data-store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, AlertTriangle, Users, Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"

const HPC_LOGO_URL = "/images/logo-20hpc.png"

export default function DashboardPage() {
  const { isLoggedIn, settings } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AppData | null>(null)
  const [runningOrders, setRunningOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [dbEmployeeCount, setDbEmployeeCount] = useState<number>(0)
  const [dbProductCount, setDbProductCount] = useState<number>(0)
  const [dbJobCount, setDbJobCount] = useState<number>(0)
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([])
  const [loadingUpcoming, setLoadingUpcoming] = useState(true)
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [employeeStockData, setEmployeeStockData] = useState<any[]>([])
  const [loadingEmpStock, setLoadingEmpStock] = useState(true)

  useEffect(() => {
    if (isLoggedIn) {
      setData(getData())
      fetchDashboardData()
    }
  }, [isLoggedIn])

  const fetchDashboardData = async () => {
    try {
      setLoadingOrders(true)
      setLoadingUpcoming(true)
      setLoadingEmpStock(true)

      const [ordersRes, upcomingRes, empCountRes, prodCountRes, jobCountRes, productsRes, employeesRes] = await Promise.all([
        fetch("/api/jobs/pending"),
        fetch("/api/jobs/upcoming"),
        fetch("/api/employees?countOnly=true"),
        fetch("/api/products?countOnly=true"),
        fetch("/api/jobs?countOnly=true"),
        fetch("/api/products"),
        fetch("/api/employees"),
      ])

      if (ordersRes.ok) {
        const orders = await ordersRes.json()
        setRunningOrders(orders.filter((order: any) => order.employeeName !== 'Unassigned'))
      }
      if (upcomingRes.ok) {
        setUpcomingJobs(await upcomingRes.json())
      }
      if (empCountRes.ok) {
        const { count } = await empCountRes.json()
        setDbEmployeeCount(count)
      }
      if (prodCountRes.ok) {
        const { count } = await prodCountRes.json()
        setDbProductCount(count)
      }
      if (jobCountRes.ok) {
        const { count } = await jobCountRes.json()
        setDbJobCount(count)
      }
      if (productsRes.ok) {
        const products = await productsRes.json()
        setLowStockProducts(products.filter((p: any) => p.quantityAvailable <= 10))
      }
      if (employeesRes.ok) {
        const emps = await employeesRes.json()
        setEmployees(emps.filter((e: any) => e.isActive))
        // Fetch stock for each active employee in parallel
        const activeEmps = emps.filter((e: any) => e.isActive)
        const stockPromises = activeEmps.map((emp: any) =>
          fetch(`/api/employees/stock?employeeId=${emp.employeeId}`)
            .then(r => r.ok ? r.json() : [])
            .then(stock => ({ employee: emp, stock }))
            .catch(() => ({ employee: emp, stock: [] }))
        )
        const stockResults = await Promise.all(stockPromises)
        setEmployeeStockData(stockResults.filter(r => r.stock.length > 0))
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoadingOrders(false)
      setLoadingUpcoming(false)
      setLoadingEmpStock(false)
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

  const logoUrl = settings.logoUrl || HPC_LOGO_URL

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center gap-4 animate-fade-in">
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
          lowStockCount={lowStockProducts.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Running Orders - spans 2 cols */}
          <RunningOrders orders={runningOrders} loading={loadingOrders} />

          {/* Upcoming Services with Quick Assign */}
          <UpcomingServicesCard jobs={upcomingJobs} employees={employees} loading={loadingUpcoming} />

          {/* Low Stock from DB */}
          <LowStockCard products={lowStockProducts} />

          {/* Employee Stock Usage */}
          <EmployeeStockOverview data={employeeStockData} loading={loadingEmpStock} />

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
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
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
                {orders.slice(0, 5).map((order, idx) => (
                  <TableRow key={order.id} className="table-row-hover stagger-item animate-fade-in opacity-0" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards' }}>
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
            {orders.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/jobs">
                  <Button variant="link" size="sm">View all {orders.length} orders</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UpcomingServicesCard({ jobs, employees, loading }: { jobs: any[], employees: any[], loading: boolean }) {
  const router = useRouter()

  const handleAssignJob = (job: any) => {
    // Navigate to jobs page with pre-selected customer
    router.push(`/jobs?customerId=${job.id}&customerName=${encodeURIComponent(job.customerName)}`)
  }

  return (
    <Card className="col-span-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Upcoming Services
        </CardTitle>
        <CardDescription>Services due in the next 3 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No upcoming services scheduled for the next 3 days.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job, idx) => (
              <div key={job.id} className="p-3 bg-muted/40 rounded-lg border space-y-2 hover-lift stagger-item animate-fade-in opacity-0" style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{job.customerName}</div>
                    <div className="text-xs text-muted-foreground">{job.serviceType || "General Service"}</div>
                    {job.customerContact && (
                      <div className="text-xs text-muted-foreground">{job.customerContact}</div>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-background shrink-0">
                    {job.scheduledDate ? format(parseISO(job.scheduledDate), "dd MMM") : "N/A"}
                  </Badge>
                </div>
                {job.employeeName === 'Unassigned' && (
                  <Link href="/jobs">
                    <Button size="sm" variant="outline" className="w-full gap-2 text-xs">
                      Assign Employee <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
            {jobs.length > 5 && (
              <Link href="/jobs">
                <Button variant="link" size="sm" className="w-full">
                  View all {jobs.length} upcoming
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LowStockCard({ products }: { products: any[] }) {
  if (products.length === 0) {
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
          Low Stock Alerts ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {products.slice(0, 5).map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.productId}</p>
            </div>
            <Badge variant={product.quantityAvailable === 0 ? "destructive" : "secondary"}>
              {product.quantityAvailable} {product.unit}
            </Badge>
          </div>
        ))}
        {products.length > 5 && (
          <Link href="/stock">
            <Button variant="link" size="sm" className="w-full">
              View all {products.length} low stock items
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function EmployeeStockOverview({ data, loading }: { data: any[], loading: boolean }) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-500" />
          Employee Stock in Hand
        </CardTitle>
        <CardDescription>Products currently assigned to employees</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">No employees have stock assigned.</p>
        ) : (
          <div className="space-y-4">
            {data.map(({ employee, stock }) => (
              <div key={employee.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{employee.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{employee.employeeId}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stock.map((item: any) => (
                    <div key={item.productId} className="text-xs bg-muted/50 rounded px-2 py-1.5">
                      <span className="font-medium">{item.productName}</span>
                      <div className="text-muted-foreground">{item.quantityGiven} {item.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
