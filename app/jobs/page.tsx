"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobAssignmentForm } from "@/components/jobs/job-assignment-form"
import { JobHistoryTable } from "@/components/jobs/job-history-table"
import type { AppData, ProductAssignment } from "@/lib/types"
import { getData, saveData, assignJob } from "@/lib/data-store"
import { ClipboardList, History } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function JobsPage() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<AppData | null>(null)

  useEffect(() => {
    if (isLoggedIn) {
      setData(getData())
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const handleJobSubmit = (
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
    if (!data) return

    const updated = assignJob(
      data,
      billNumber,
      customerId,
      customerName,
      employeeId,
      employeeName,
      jobDate,
      productsAssigned,
      amount,
      serviceType,
      nextServiceDate,
      remarks,
    )
    saveData(updated)
    setData(updated)
    toast.success(`Job ${billNumber} successfully assigned to ${employeeName}`)
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
              Job History ({data.jobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assign">
            {data.employees.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No employees available. Please add employees first.
                </CardContent>
              </Card>
            ) : data.products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No products available. Please add products first.
                </CardContent>
              </Card>
            ) : data.products.every((p) => p.quantityAvailable === 0) ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  All products are out of stock. Please restock to assign jobs.
                </CardContent>
              </Card>
            ) : (
              <JobAssignmentForm
                employees={data.employees}
                products={data.products}
                customers={data.customers || []} // Pass customers
                existingJobs={data.jobs}
                onSubmit={handleJobSubmit}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Job History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobHistoryTable jobs={data.jobs} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
