"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Trash2 } from "lucide-react"
import type { Customer } from "@/lib/types"

interface CustomerTableProps {
    customers: Customer[]
    onEdit: (customer: Customer) => void
    onDelete: (customer: Customer) => void
    onView: (customer: Customer) => void
}

export function CustomerTable({ customers, onEdit, onDelete, onView }: CustomerTableProps) {
    if (customers.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No customers found. Add your first customer!
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            Name
                        </TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="hidden md:table-cell">Address</TableHead>
                        <TableHead className="hidden lg:table-cell">Contract Amount</TableHead>
                        <TableHead className="hidden lg:table-cell">Contract Period</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.contactNumber}</TableCell>
                            <TableCell className="hidden md:table-cell truncate max-w-[200px]">{customer.address}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                                {customer.contractAmount ? `₹${customer.contractAmount}` : "-"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                {customer.contractStartDate && customer.contractEndDate
                                    ? <span className="text-xs">{new Date(customer.contractStartDate).toLocaleDateString()} - {new Date(customer.contractEndDate).toLocaleDateString()}</span>
                                    : "-"
                                }
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onView(customer)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(customer)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
