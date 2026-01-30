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
    const [data, setData] = useState<AppData | null>(null)
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(true)

    // Job Completion State
    const [completingJob, setCompletingJob] = useState<Job | null>(null)
    const [usageInput, setUsageInput] = useState<Record<string, number>>({})
    const [returnStockOpen, setReturnStockOpen] = useState(false)

    useEffect(() => {
        const employeeId = getEmployeeSession()
        if (!employeeId) {
            router.push("/employee/login")
            return
        }

        const appData = getData()
        const employee = appData.employees.find((e) => e.employeeId === employeeId)

        if (!employee) {
            employeeLogout()
            router.push("/employee/login")
            return
        }

        setData(appData)
        setCurrentEmployee(employee)
        setLoading(false)
    }, [router])

    const handleLogout = () => {
        employeeLogout()
        router.push("/employee/login")
    }

    const handleCompleteClick = (job: Job) => {
        setCompletingJob(job)
        // Initialize usage with assigned values (assuming full usage by default)
        const initialUsage: Record<string, number> = {}
        job.productsAssigned.forEach(p => {
            initialUsage[p.productId] = p.quantityGiven
        })
        setUsageInput(initialUsage)
    }

    const handleUsageChange = (productId: string, val: string) => {
        const num = parseFloat(val)
        if (isNaN(num)) return
        setUsageInput(prev => ({ ...prev, [productId]: num }))
    }

    const handleConfirmCompletion = () => {
        if (!completingJob || !data) return

        // Validate usage
        for (const assignment of completingJob.productsAssigned) {
            const used = usageInput[assignment.productId] || 0
            if (used > assignment.quantityGiven) {
                toast.error(`Usage for ${assignment.productName} cannot exceed assigned quantity (${assignment.quantityGiven})`)
                return
            }
            if (used < 0) {
                toast.error("Usage cannot be negative")
                return
            }
        }

        const productsUsed: ProductAssignment[] = completingJob.productsAssigned.map(a => ({
            ...a,
            quantityGiven: usageInput[a.productId] || 0
        }))

        const updated = completeJob(data, completingJob.id, productsUsed)
        saveData(updated)
        setData(updated)
        setCompletingJob(null)
        toast.success("Job completed and stock updated successfully")
    }

    const handleReturnStock = () => {
        // Refresh data
        setData(getData())
        const updatedEmp = getData().employees.find(e => e.employeeId === currentEmployee?.employeeId)
        if (updatedEmp) setCurrentEmployee(updatedEmp)
    }

    if (loading || !data || !currentEmployee) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    const myJobs = data.jobs.filter(j => j.employeeId === currentEmployee.employeeId)
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
                            My Stock in Hand
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setReturnStockOpen(true)}>
                            Return Stock
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {(!currentEmployee?.stockInHand || currentEmployee.stockInHand.length === 0) ? (
                            <p className="text-muted-foreground text-center py-4">No stock currently assigned.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {currentEmployee.stockInHand.map((item, idx) => (
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
                            pendingJobs.map(job => (
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
                                                {job.productsAssigned.map(p => (
                                                    <li key={p.productId} className="flex justify-between">
                                                        <span>{p.productName}</span>
                                                        <span className="font-medium">{formatQuantityWithUnit(p.quantityGiven, p.unit)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {job.remarks && <p className="text-sm text-muted-foreground">Note: {job.remarks}</p>}
                                        <Button className="w-full" onClick={() => handleCompleteClick(job)}>Complete Job & Return Stock</Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                        {completedJobs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No completed jobs yet.</div>
                        ) : (
                            completedJobs.map(job => (
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
                                        <div className="text-sm space-y-1">
                                            <p><strong>Date:</strong> {job.jobDate}</p>
                                            <p><strong>Actual Usage:</strong></p>
                                            <ul className="list-disc list-inside pl-2">
                                                {job.productsUsed?.map(p => (
                                                    <li key={p.productId}>
                                                        {p.productName}: {formatQuantityWithUnit(p.quantityGiven, p.unit)}
                                                    </li>
                                                ))}
                                            </ul>
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
                            Enter the actual quantity of products used.
                        </DialogDescription>
                    </DialogHeader>

                    {completingJob && (
                        <div className="space-y-4 py-4">
                            {completingJob.productsAssigned.map(p => (
                                <div key={p.productId} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <Label>{p.productName}</Label>
                                        <span className="text-muted-foreground">Assigned: {formatQuantityWithUnit(p.quantityGiven, p.unit)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            max={p.quantityGiven}
                                            step="0.01"
                                            value={usageInput[p.productId]}
                                            onChange={(e) => handleUsageChange(p.productId, e.target.value)}
                                        />
                                        <span className="text-sm text-muted-foreground w-12">{p.unit}</span>
                                    </div>
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
    employee: Employee
    onReturn: () => void
}

function ReturnStockDialog({ open, onOpenChange, employee, onReturn }: ReturnStockDialogProps) {
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

    const handleSubmit = () => {
        const productsToReturn: ProductAssignment[] = []

        Object.entries(selectedProducts).forEach(([productId, qty]) => {
            if (qty > 0) {
                const stockItem = employee.stockInHand?.find(s => s.productId === productId)
                if (stockItem) {
                    productsToReturn.push({
                        ...stockItem,
                        quantityGiven: qty
                    })
                }
            }
        })

        if (productsToReturn.length === 0) {
            toast.error("Please select at least one item to return")
            return
        }

        const data = getData()
        // We know employee exists
        const updated = createStockReturnRequest(data, employee.employeeId, productsToReturn)
        saveData(updated)
        toast.success("Stock return request sent to admin")
        onReturn()
        onOpenChange(false)
        setSelectedProducts({})
    }

    const availableStock = employee.stockInHand || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Return Stock</DialogTitle>
                    <DialogDescription>
                        Select items from your stock to return to the warehouse.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {availableStock.length === 0 ? (
                        <p className="text-muted-foreground text-center">You have no stock to return.</p>
                    ) : (
                        availableStock.map(item => (
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
