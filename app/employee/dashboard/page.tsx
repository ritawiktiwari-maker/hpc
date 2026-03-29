"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, ClipboardList, Package, CheckCircle, Clock } from "lucide-react"
import type { AppData, Employee, Job, ProductAssignment } from "@/lib/types"
import { getData, saveData, completeJob } from "@/lib/data-store"
import { getEmployeeSession, employeeLogout } from "@/lib/auth"
import { formatQuantityWithUnit } from "@/lib/types"
import { toast } from "sonner"

export default function EmployeeDashboard() {
    const router = useRouter()
    const [currentEmployee, setCurrentEmployee] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [myStock, setMyStock] = useState<any[]>([])
    const [myJobs, setMyJobs] = useState<any[]>([])

    // Job Completion State
    const [completingJob, setCompletingJob] = useState<any | null>(null)
    const [usageInput, setUsageInput] = useState<Record<string, number>>({})
    const [returnStockOpen, setReturnStockOpen] = useState(false)

    useEffect(() => {
        const employeeId = getEmployeeSession()
        if (!employeeId) {
            router.push("/employee/login")
            return
        }
        fetchEmployeeData(employeeId)
    }, [router])

    const fetchEmployeeData = async (employeeId: string) => {
        setLoading(true)
        try {
            // Fetch all data in parallel with filtered endpoints
            const [stockRes, jobsRes, empRes] = await Promise.all([
                fetch(`/api/employees/stock?employeeId=${employeeId}`),
                fetch(`/api/jobs?employeeId=${employeeId}`),
                fetch(`/api/employees?employeeId=${employeeId}`),
            ])

            if (stockRes.ok) {
                const stock = await stockRes.json()
                setMyStock(stock)
            }

            if (jobsRes.ok) {
                const jobs = await jobsRes.json()
                setMyJobs(jobs.map((j: any) => ({
                    id: j.id,
                    billNumber: j.billNumber || 'N/A',
                    customerName: j.customer?.name || 'Unknown',
                    jobDate: new Date(j.scheduledDate).toLocaleDateString(),
                    status: j.status.toLowerCase(),
                    productsAssigned: j.productsUsed?.map((pu: any) => ({
                        productId: pu.product.id,
                        productName: pu.product.name,
                        quantityGiven: pu.quantity,
                        unit: pu.product.unit
                    })) || []
                })))
            }

            if (empRes.ok) {
                const emp = await empRes.json()
                if (emp && !emp.error) setCurrentEmployee(emp)
            }

        } catch (error) {
            console.error("Failed to fetch employee data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        employeeLogout()
        router.push("/employee/login")
    }

    const handleCompleteClick = (job: any) => {
        setCompletingJob(job)
        const initialUsage: Record<string, number> = {}
        job.productsAssigned.forEach((p: any) => {
            initialUsage[p.productId] = p.quantityGiven
        })
        setUsageInput(initialUsage)
    }

    const handleUsageChange = (productId: string, val: string) => {
        const num = parseFloat(val)
        if (isNaN(num)) return
        setUsageInput(prev => ({ ...prev, [productId]: num }))
    }

    const handleConfirmCompletion = async () => {
        if (!completingJob || !currentEmployee) return

        try {
            const productsUsedPayload = Object.entries(usageInput).map(([productId, quantity]) => ({
                productId,
                quantity
            }))

            const response = await fetch(`/api/jobs/${completingJob.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productsUsed: productsUsedPayload })
            })

            if (response.ok) {
                toast.success(`Job for ${completingJob.customerName} marked as Completed!`)
                setCompletingJob(null)
                // Refresh dashboard data so job moves to Completed tab
                fetchEmployeeData(currentEmployee.employeeId)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to complete job')
            }
        } catch (err) {
            toast.error('An error occurred while completing the job')
        }
    }

    const handleReturnStock = () => {
        if (currentEmployee) {
            fetchEmployeeData(currentEmployee.employeeId)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>
    }

    if (!currentEmployee) {
        return <div className="min-h-screen flex items-center justify-center">Employee not found.</div>
    }

    const pendingJobs = myJobs.filter(j => j.status === 'pending')
    const completedJobs = myJobs.filter(j => j.status === 'completed')

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {currentEmployee.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="font-semibold">{currentEmployee.name}</h1>
                            <p className="text-xs text-muted-foreground">{currentEmployee.employeeId}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Jobs</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{pendingJobs.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed Jobs</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{completedJobs.length}</div></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            My Stock in Hand (DB)
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setReturnStockOpen(true)}>
                            Return Stock
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {(!myStock || myStock.length === 0) ? (
                            <p className="text-muted-foreground text-center py-4">No stock currently assigned in database.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {myStock.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-muted rounded-lg border">
                                        <div className="text-sm font-medium">{item.productName}</div>
                                        <div className="text-2xl font-bold">{item.quantityGiven} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Tabs defaultValue="pending" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="pending" className="gap-2"><Clock className="w-4 h-4" /> Pending</TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2"><CheckCircle className="w-4 h-4" /> Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingJobs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No pending jobs assigned to you.</div>
                        ) : (
                            pendingJobs.map((job: any) => (
                                <Card key={job.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{job.customerName}</CardTitle>
                                                <CardDescription>Bill #: {job.billNumber}</CardDescription>
                                            </div>
                                            <Badge variant="outline">{job.jobDate}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/50 p-3 rounded-md">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Package className="w-4 h-4" /> Assigned Stock</h4>
                                            <ul className="text-sm space-y-1">
                                                {job.productsAssigned.map((p: any) => (
                                                    <li key={p.productId} className="flex justify-between">
                                                        <span>{p.productName}</span>
                                                        <span className="font-medium">{formatQuantityWithUnit(p.quantityGiven, p.unit)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button className="w-full" onClick={() => handleCompleteClick(job)}>Complete Job</Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                        {completedJobs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No completed jobs yet.</div>
                        ) : (
                            completedJobs.map((job: any) => (
                                <Card key={job.id} className="opacity-75">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{job.customerName}</CardTitle>
                                                <CardDescription>Bill #: {job.billNumber}</CardDescription>
                                            </div>
                                            <Badge variant="secondary">Completed</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm">
                                            <p><strong>Date:</strong> {job.jobDate}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <Dialog open={!!completingJob} onOpenChange={(open) => !open && setCompletingJob(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Job</DialogTitle>
                        <DialogDescription>
                            Confirm completion of this job assignment.
                        </DialogDescription>
                    </DialogHeader>

                    {completingJob && (
                        <div className="space-y-4 py-4">
                            {completingJob.productsAssigned.map((p: any) => (
                                <div key={p.productId} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <Label className="flex-1">{p.productName}</Label>
                                        <div className="flex items-center gap-2 w-32">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={usageInput[p.productId] !== undefined ? usageInput[p.productId] : ''}
                                                onChange={(e) => handleUsageChange(p.productId, e.target.value)}
                                            />
                                            <span className="text-muted-foreground">{p.unit}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right border-b pb-2">Assigned: {formatQuantityWithUnit(p.quantityGiven, p.unit)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompletingJob(null)}>Cancel</Button>
                        <Button onClick={handleConfirmCompletion}>Confirm Completion</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ReturnStockDialog
                open={returnStockOpen}
                onOpenChange={setReturnStockOpen}
                employee={currentEmployee}
                onReturn={handleReturnStock}
                stockInHand={myStock}
            />
        </div>
    )
}

import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createStockReturnRequest } from "@/lib/data-store"

interface ReturnStockDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    employee: any
    onReturn: () => void
    stockInHand: any[]
}

function ReturnStockDialog({ open, onOpenChange, employee, onReturn, stockInHand }: ReturnStockDialogProps) {
    const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})

    const handleQuantityChange = (productId: string, val: string) => {
        const num = parseFloat(val)
        if (isNaN(num)) {
            const newSelected = { ...selectedProducts }
            delete newSelected[productId]
            setSelectedProducts(newSelected)
            return
        }
        setSelectedProducts(prev => ({ ...prev, [productId]: num }))
    }

    const handleSubmit = async () => {
        const productsToReturn = Object.entries(selectedProducts)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => ({
                productId, // UUID in the database
                quantity: qty
            }))

        if (productsToReturn.length === 0) {
            toast.error("Please select at least one item to return")
            return
        }

        try {
            const response = await fetch("/api/stock/return-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: employee.employeeId,
                    items: productsToReturn
                })
            })

            if (response.ok) {
                toast.success("Stock return request sent to admin")
                onReturn()
                onOpenChange(false)
                setSelectedProducts({})
            } else {
                toast.error("Failed to send return request")
            }
        } catch (error) {
            toast.error("An error occurred while sending request")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Return Stock</DialogTitle>
                    <DialogDescription>
                        Select items from your stock in database to return.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {(!stockInHand || stockInHand.length === 0) ? (
                        <p className="text-muted-foreground text-center">You have no database stock to return.</p>
                    ) : (
                        stockInHand.map((item: any) => (
                            <div key={item.productId} className="flex items-center gap-4 justify-between border p-2 rounded">
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{item.productName}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Available: {item.quantityGiven} {item.unit}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-32">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        max={item.quantityGiven}
                                        step="0.01"
                                        className="h-8"
                                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                                    />
                                    <span className="text-xs text-muted-foreground">{item.unit}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={Object.keys(selectedProducts).length === 0}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
