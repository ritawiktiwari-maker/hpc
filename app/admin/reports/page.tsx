"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getData } from "@/lib/data-store"
import type { AppData, Job } from "@/lib/types"
import { formatQuantityWithUnit } from "@/lib/types"
import { toast } from "sonner"

export default function ReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })
    const [data, setData] = useState<AppData | null>(null)

    useEffect(() => {
        setData(getData())
    }, [])

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">Loading...</div>
            </AdminLayout>
        )
    }

    const filteredJobs = data.jobs.filter(job => {
        if (job.status !== 'completed' || !job.jobDate) return false
        if (!date?.from) return true

        const jobDate = new Date(job.jobDate)
        const from = new Date(date.from)
        from.setHours(0, 0, 0, 0)

        const to = date.to ? new Date(date.to) : new Date(from)
        to.setHours(23, 59, 59, 999)

        return jobDate >= from && jobDate <= to
    }).sort((a, b) => new Date(b.jobDate).getTime() - new Date(a.jobDate).getTime())

    // Calculate totals
    const totalServices = filteredJobs.length
    const uniqueCustomers = new Set(filteredJobs.map(j => j.customerId)).size
    // If you want to track total stock usage, you could aggregate here

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Service Reports</h1>
                        <p className="text-muted-foreground">View completed services and stock usage by date range.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => {
                            if (filteredJobs.length === 0) {
                                toast.error("No data to export")
                                return
                            }
                            // Need to import this function
                            import("@/lib/excel-export").then(mod => {
                                mod.exportReportsToExcel(filteredJobs, data.customers)
                                toast.success("Report downloaded successfully")
                            })
                        }}>
                            <Download className="mr-2 h-4 w-4" /> Export Excel
                        </Button>
                        <div className={cn("grid gap-2")}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-[300px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Services</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{totalServices}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Customers Served</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{uniqueCustomers}</div></CardContent>
                    </Card>
                    {/* Add more stats if needed */}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer Details</TableHead>
                                        <TableHead>Service / Employee</TableHead>
                                        <TableHead>Stock Used</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No completed services found in this range.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredJobs.map(job => {
                                            const customer = data.customers.find(c => c.id === job.customerId)
                                            return (
                                                <TableRow key={job.id}>
                                                    <TableCell className="align-top whitespace-nowrap">
                                                        {new Date(job.jobDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="font-medium">{job.customerName}</div>
                                                        <div className="text-xs text-muted-foreground">{customer?.address}</div>
                                                        <div className="text-xs text-muted-foreground">{customer?.contactNumber}</div>
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="text-sm font-medium">{job.serviceType || "Standard Service"}</div>
                                                        <div className="text-xs text-muted-foreground">By: {job.employeeName}</div>
                                                        {job.amount && <div className="text-xs font-semibold mt-1">Bill: ₹{job.amount}</div>}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        {job.productsUsed && job.productsUsed.length > 0 ? (
                                                            <ul className="text-sm space-y-1">
                                                                {job.productsUsed.map((p, idx) => (
                                                                    <li key={idx}>
                                                                        {p.productName}: <strong>{formatQuantityWithUnit(p.quantityGiven, p.unit)}</strong>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
