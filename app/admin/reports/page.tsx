"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Users, TrendingUp } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface ServiceReportItem {
    id: string
    date: string
    customerName: string
    customerAddress: string
    customerContact: string
    serviceType: string
    employeeName: string
    productsUsed: {
        productName: string
        quantity: number
        unit: string
    }[]
}

interface LeadReportItem {
    id: string
    name: string
    mobile: string
    source: string
    status: string
    createdAt: string
    convertedTo: string | null
    employeeName: string | null
}

interface ReportData {
    services: ServiceReportItem[]
    leads: {
        total: number
        converted: number
        conversionRate: string
        list: LeadReportItem[]
    }
}

export default function ReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    })
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchData = useCallback(async () => {
        if (!date?.from) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                from: date.from.toISOString(),
                to: date.to ? date.to.toISOString() : date.from.toISOString()
            })
            const res = await fetch(`/api/reports?${params}`)
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.details || "Failed to fetch reports")
            }
            const jsonData = await res.json()
            setData(jsonData)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to load reports")
        } finally {
            setLoading(false)
        }
    }, [date])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Reports</h1>
                        <p className="text-muted-foreground">View insights for services, customers, and leads.</p>
                    </div>
                    <div className="flex items-center gap-2">
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

                {loading ? (
                    <div className="text-center py-10">Loading report data...</div>
                ) : data ? (
                    <Tabs defaultValue="services" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="services">Completed Services</TabsTrigger>
                            <TabsTrigger value="leads">Leads & Conversion</TabsTrigger>
                        </TabsList>

                        <TabsContent value="services" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Services</CardTitle></CardHeader>
                                    <CardContent><div className="text-2xl font-bold">{data.services.length}</div></CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Service Report</CardTitle>
                                    <CardDescription>
                                        Completed services within the selected date range.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Customer</TableHead>
                                                    <TableHead>Service / Employee</TableHead>
                                                    <TableHead>Stock Used</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.services.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                            No data found.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    data.services.map(item => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="align-top whitespace-nowrap">
                                                                {new Date(item.date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <div className="font-medium">{item.customerName}</div>
                                                                <div className="text-xs text-muted-foreground">{item.customerAddress}</div>
                                                                <div className="text-xs text-muted-foreground">{item.customerContact}</div>
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <div className="text-sm font-medium">{item.serviceType}</div>
                                                                <div className="text-xs text-muted-foreground">By: {item.employeeName}</div>
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                {item.productsUsed.length > 0 ? (
                                                                    <ul className="text-sm space-y-1">
                                                                        {item.productsUsed.map((p, i) => (
                                                                            <li key={i}>{p.productName}: <b>{p.quantity} {p.unit}</b></li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-xs">-</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="leads" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Leads</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold flex items-center">
                                            <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                                            {data.leads.total}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Converted to Customer</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold flex items-center text-green-600">
                                            <TrendingUp className="mr-2 h-5 w-5" />
                                            {data.leads.converted}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{data.leads.conversionRate}%</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Leads Status Report</CardTitle>
                                    <CardDescription>
                                        Track lead conversion and status changes.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Created Date</TableHead>
                                                    <TableHead>Lead Name</TableHead>
                                                    <TableHead>Source</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Converted To</TableHead>
                                                    <TableHead>Handled By</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.leads.list.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                            No leads found in this period.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    data.leads.list.map(lead => (
                                                        <TableRow key={lead.id}>
                                                            <TableCell className="whitespace-nowrap">
                                                                {new Date(lead.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {lead.name}
                                                                <div className="text-xs text-muted-foreground">{lead.mobile}</div>
                                                            </TableCell>
                                                            <TableCell>{lead.source || "-"}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={lead.status === "CONVERTED" ? "success" : "secondary"}>
                                                                    {lead.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {lead.convertedTo ? (
                                                                    <span className="font-medium text-green-600">
                                                                        {lead.convertedTo}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-xs">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{lead.employeeName || "-"}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : null}
            </div>
        </AdminLayout>
    )
}
