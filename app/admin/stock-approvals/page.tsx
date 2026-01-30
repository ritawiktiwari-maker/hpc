"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatQuantityWithUnit } from "@/lib/types"
import type { AppData, StockReturnRequest } from "@/lib/types"
import { getData, saveData, approveStockReturn, rejectStockReturn } from "@/lib/data-store"
import { CheckCircle, XCircle, Package, Clock } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function StockApprovalsPage() {
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

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
            </AdminLayout>
        )
    }

    const pendingRequests = data.stockReturnRequests.filter(r => r.status === "pending")

    const handleApprove = (id: string) => {
        if (!data) return
        const updated = approveStockReturn(data, id)
        saveData(updated)
        setData(updated)
        toast.success("Stock return approved successfully")
    }

    const handleReject = (id: string) => {
        if (!data) return
        const updated = rejectStockReturn(data, id)
        saveData(updated)
        setData(updated)
        toast.success("Stock return rejected")
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Stock Return Approvals</h1>
                    <p className="text-muted-foreground">Review and approve stock returns from employees</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Pending Requests ({pendingRequests.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                No pending stock return requests.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Job/Bill</TableHead>
                                        <TableHead>Returned Items</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                {format(new Date(request.requestedAt), "dd MMM yyyy, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{request.employeeName}</div>
                                                <div className="text-xs text-muted-foreground">{request.employeeId}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{request.billNumber}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {request.productsReturned.map((p, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="font-medium">{p.productName}:</span>
                                                            <span>{formatQuantityWithUnit(p.quantityGiven, p.unit)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleReject(request.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#7CB342] hover:bg-[#689F38]"
                                                        onClick={() => handleApprove(request.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
