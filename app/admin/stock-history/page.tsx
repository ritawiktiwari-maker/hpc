"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatQuantityWithUnit } from "@/lib/types"
import { History, ArrowUpRight, ArrowDownLeft, Package } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function StockHistoryPage() {
    const { isLoggedIn } = useAuth()
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isLoggedIn) {
            fetchTransactions()
        }
    }, [isLoggedIn])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/stock/transactions")
            if (response.ok) {
                const data = await response.json()
                setTransactions(data)
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Stock History</h1>
                    <p className="text-muted-foreground">Track all product movements, purchases, and returns</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Transaction Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No stock transactions recorded yet.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{t.product?.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "flex items-center w-fit gap-1",
                                                        t.type === 'PURCHASE' || t.type === 'RETURN_FROM_EMPLOYEE'
                                                            ? "text-[#7CB342] border-[#7CB342]/20 bg-[#7CB342]/5"
                                                            : "text-amber-600 border-amber-200 bg-amber-50"
                                                    )}
                                                >
                                                    {t.type === 'PURCHASE' || t.type === 'RETURN_FROM_EMPLOYEE' ? (
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowDownLeft className="h-3 w-3" />
                                                    )}
                                                    {t.type.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={cn(
                                                "font-semibold",
                                                t.type === 'PURCHASE' || t.type === 'RETURN_FROM_EMPLOYEE' ? "text-[#7CB342]" : "text-amber-600"
                                            )}>
                                                {t.type === 'PURCHASE' || t.type === 'RETURN_FROM_EMPLOYEE' ? "+" : "-"}
                                                {formatQuantityWithUnit(Math.abs(t.quantity), t.product?.unit)}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                {t.remarks || "-"}
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
