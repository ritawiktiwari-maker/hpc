"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatQuantityWithUnit } from "@/lib/types"
import type { Customer, Job } from "@/lib/types"
import { Calendar, Receipt, User, Clock } from "lucide-react"

interface ServiceHistoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
    jobs: Job[]
}

export function ServiceHistoryDialog({
    open,
    onOpenChange,
    customer,
    jobs,
}: ServiceHistoryDialogProps) {
    if (!customer) return null

    // Sort jobs by date descending (newest first)
    const sortedJobs = [...jobs].sort(
        (a, b) => new Date(b.jobDate).getTime() - new Date(a.jobDate).getTime()
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Service History: {customer.name}
                    </DialogTitle>
                    <DialogDescription>
                        View all services and transactions for this customer.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto mt-4 border rounded-md">
                    {sortedJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20">
                            <Clock className="h-12 w-12 mb-2 opacity-20" />
                            <p>No service history found for this customer.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0">
                                <TableRow>
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Bill #</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead>Next Service</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                {job.jobDate}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Receipt className="h-3 w-3 text-muted-foreground" />
                                                {job.billNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {job.serviceType || <span className="text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                        <TableCell>{job.employeeName}</TableCell>
                                        <TableCell>
                                            <div className="text-xs space-y-1">
                                                {job.productsAssigned.map((p) => (
                                                    <div key={p.productId}>
                                                        {p.productName}: {formatQuantityWithUnit(p.quantityGiven, p.unit)}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {job.amount ? `₹${job.amount}` : "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={job.status === "completed" ? "default" : "secondary"}
                                                className={job.status === "completed" ? "bg-[#7CB342]" : ""}
                                            >
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {job.nextServiceDate ? (
                                                <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                                                    <Clock className="h-3 w-3" />
                                                    {job.nextServiceDate}
                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
