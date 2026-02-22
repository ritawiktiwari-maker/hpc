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
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isLoggedIn) {
            fetchRequests()
        }
    }, [isLoggedIn])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/stock/return-request?status=PENDING")
            if (response.ok) {
                const data = await response.json()
                setRequests(data)
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error)
            toast.error("Failed to load return requests")
        } finally {
            setLoading(false)
        }
    }

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/stock/return-request/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED" })
            })
            if (response.ok) {
                toast.success("Stock return approved successfully")
                fetchRequests()
            } else {
                const error = await response.json()
                toast.error(error.error || "Failed to approve request")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleReject = async (id: string) => {
        try {
            const response = await fetch(`/api/stock/return-request/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" })
            })
            if (response.ok) {
                toast.success("Stock return rejected")
                fetchRequests()
            } else {
                const error = await response.json()
                toast.error(error.error || "Failed to reject request")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
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
                            Pending Requests ({requests.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading...</div>
                        ) : requests.length === 0 ? (
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
                                        <TableHead>Items to Return</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                {format(new Date(request.requestedAt), "dd MMM yyyy, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{request.employee?.name}</div>
                                                <div className="text-xs text-muted-foreground">{request.employee?.employeeId}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {request.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="font-medium">{item.product?.name}:</span>
                                                            <span>{formatQuantityWithUnit(item.quantity, item.product?.unit)}</span>
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
