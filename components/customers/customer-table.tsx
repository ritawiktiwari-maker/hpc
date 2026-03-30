"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Customer } from "@/lib/types"

interface CustomerTableProps {
    customers: Customer[]
    onEdit: (customer: Customer) => void
    onDelete: (customer: Customer) => void
    onView: (customer: Customer) => void
}

export function CustomerTable({ customers, onEdit, onDelete, onView }: CustomerTableProps) {
    const router = useRouter()

    if (customers.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No customers found. Add your first customer!
            </div>
        )
    }

    const handleAssignJob = (customer: Customer) => {
        router.push(`/jobs?customerId=${customer.id}&tab=assign`)
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="hidden md:table-cell">Service Type</TableHead>
                        <TableHead className="hidden lg:table-cell">Contract Amount</TableHead>
                        <TableHead className="hidden lg:table-cell">Contract Period</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => {
                        const contract = customer.contracts && customer.contracts[0] ? customer.contracts[0] : null
                        const pendingCount = (customer as any)._count?.visits ?? 0
                        const serviceType = contract?.serviceType || customer.serviceType || ""
                        const firstService = serviceType.split(',')[0]?.trim()
                        const serviceCount = serviceType.split(',').filter(Boolean).length

                        return (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <div className="font-medium">{customer.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[180px] md:hidden">{customer.address}</div>
                                </TableCell>
                                <TableCell>
                                    <div>{customer.contactNumber}</div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {firstService ? (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm truncate max-w-[160px]">{firstService}</span>
                                            {serviceCount > 1 && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">
                                                    +{serviceCount - 1}
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {(() => {
                                        const amount = contract ? (contract.contractValue || contract.contractAmount) : customer.contractAmount
                                        return amount ? `₹${Number(amount).toLocaleString()}` : "-"
                                    })()}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {(() => {
                                        const start = contract ? (contract.startDate || contract.contractStartDate) : customer.contractStartDate
                                        const end = contract ? (contract.endDate || contract.contractEndDate) : customer.contractEndDate
                                        if (start && end) {
                                            return <span className="text-xs">{new Date(start).toLocaleDateString()} - {new Date(end).toLocaleDateString()}</span>
                                        }
                                        return "-"
                                    })()}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {pendingCount > 0 ? (
                                        <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 text-[10px]">
                                            {pendingCount} pending
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 text-[10px]">
                                            No pending
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => onView(customer)} title="View History">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleAssignJob(customer)} title="Assign Job">
                                            <ClipboardList className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(customer)} title="Delete">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
