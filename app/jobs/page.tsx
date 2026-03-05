"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobAssignmentForm } from "@/components/jobs/job-assignment-form"
import { JobHistoryTable } from "@/components/jobs/job-history-table"
import type { AppData, ProductAssignment, Customer } from "@/lib/types"
import { getData, saveData, assignJob } from "@/lib/data-store"
import { ClipboardList, History } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function JobsPage() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<AppData | null>(null)
  const [dbCustomers, setDbCustomers] = useState<Customer[]>([])
  const [dbEmployees, setDbEmployees] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [dbJobs, setDbJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoggedIn) {
      setData(getData())
      fetchData()
    }
  }, [isLoggedIn])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [custRes, empRes, prodRes, jobsRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/employees"),
        fetch("/api/products"),
        fetch("/api/jobs")
      ])

      if (custRes.ok) setDbCustomers(await custRes.json())
      if (empRes.ok) setDbEmployees(await empRes.json())
      if (prodRes.ok) setDbProducts(await prodRes.json())
      if (jobsRes.ok) setDbJobs(await jobsRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const handleJobSubmit = async (
    billNumber: string,
    customerId: string,
    customerName: string,
    employeeId: string,
    employeeName: string,
    jobDate: string,
    productsAssigned: ProductAssignment[],
    amount: number,
    serviceType: string,
    nextServiceDate: string | undefined,
    remarks: string,
  ) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billNumber,
          customerId,
          employeeId,
          jobDate,
          productsAssigned,
          amount,
          serviceType,
          nextServiceDate,
          remarks,
        })
      })

      if (response.ok) {
        toast.success(`Job ${billNumber} successfully assigned to ${employeeName}`)
        fetchData() // Refresh everything
      } else {
        const err = await response.json()
        toast.error(err.error || "Failed to assign job")
      }
    } catch (error) {
      toast.error("An error occurred while assigning job")
    }
  }

  if (loading && !data) {
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
        <div>
          <h1 className="text-2xl font-bold">Job Assignment</h1>
          <p className="text-muted-foreground">Assign jobs and track product distribution</p>
        </div>

        <Tabs defaultValue="assign" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assign" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              New Assignment
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Job History ({dbJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assign">
            {dbEmployees.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No employees available in database. Please sync/add employees first.
                </CardContent>
              </Card>
            ) : dbProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No products available in database. Please sync/add products first.
                </CardContent>
              </Card>
            ) : (
              <JobAssignmentForm
                employees={dbEmployees}
                products={dbProducts.map((p: any) => ({
                  id: p.id,
                  productId: p.productId,
                  productName: p.name,
                  name: p.name,
                  quantityAvailable: p.quantityAvailable,
                  quantityPurchased: p.quantityPurchased || p.quantityAvailable,
                  unit: p.unit,
                  supplierName: p.supplierName || '',
                  dateOfPurchase: p.dateOfPurchase || '',
                  remarks: p.remarks || '',
                  createdAt: p.createdAt,
                  updatedAt: p.updatedAt,
                }))}
                customers={dbCustomers}
                existingJobs={dbJobs}
                onSubmit={handleJobSubmit}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Job History (Database)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* We can reuse the table but map the data */}
                <JobHistoryTable jobs={dbJobs
                  .slice()
                  .sort((a: any, b: any) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                  .map((j: any, idx: number) => ({
                    id: j.id,
                    billNumber: j.billNumber || 'N/A',
                    customerId: j.customerId || '',
                    customerName: j.customer?.name || 'Unknown',
                    employeeId: j.assignedEmployee?.employeeId || '',
                    employeeName: j.assignedEmployee?.name || 'Unassigned',
                    jobDate: j.scheduledDate,
                    status: j.status,
                    remarks: j.remarks || '',
                    createdAt: j.createdAt,
                    serviceType: j.serviceType || j.contract?.serviceType || 'Direct Visit',
                    amount: j.billAmount || 0,
                    serialNo: idx + 1,
                    productsAssigned: j.productsUsed?.map((pu: any) => ({
                      productId: pu.product.productId,
                      productName: pu.product.name,
                      quantityGiven: pu.quantity,
                      unit: pu.product.unit
                    })) || []
                  }))} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
