"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerTable } from "@/components/customers/customer-table"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { ServiceHistoryDialog } from "@/components/customers/service-history-dialog"
import type { AppData, Customer } from "@/lib/types"
import { getData, saveData, addCustomer, updateCustomer, deleteCustomer } from "@/lib/data-store"
import { exportCustomersToExcel, importCustomersFromExcel } from "@/lib/excel-export"
import { Plus, Search, Users, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CustomersPage() {
    const { isLoggedIn } = useAuth()
    const [data, setData] = useState<AppData | null>(null)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [historyOpen, setHistoryOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<Customer | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isLoggedIn) {
            setData(getData())
        }
    }, [isLoggedIn])

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    const filteredCustomers =
        data?.customers.filter(
            (cust) =>
                cust.name.toLowerCase().includes(search.toLowerCase()) ||
                cust.contactNumber.includes(search),
        ) || []

    const handleAdd = () => {
        setSelectedCustomer(null)
        setFormOpen(true)
    }

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer)
        setFormOpen(true)
    }

    const handleDeleteClick = (customer: Customer) => {
        setSelectedCustomer(customer)
        setDeleteOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (!data || !selectedCustomer) return

        const updated = deleteCustomer(data, selectedCustomer.id)
        saveData(updated)
        setData(updated)
        setDeleteOpen(false)
        setSelectedCustomer(null)
        toast.success("Customer deleted successfully")
    }

    const handleViewHistory = (customer: Customer) => {
        setSelectedHistoryCustomer(customer)
        setHistoryOpen(true)
    }

    const handleFormSubmit = (customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
        if (!data) return

        let updated: AppData
        if (selectedCustomer) {
            updated = updateCustomer(data, selectedCustomer.id, customerData)
            toast.success("Customer updated successfully")
        } else {
            updated = addCustomer(data, customerData)
            toast.success("Customer added successfully")
        }

        saveData(updated)
        setData(updated)
    }
    // ...

    const handleExport = () => {
        if (!data) return
        exportCustomersToExcel(data.customers)
        toast.success("Customers exported to Excel")
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !data) return

        try {
            const importedCustomers = await importCustomersFromExcel(file)
            let updated = data
            let count = 0

            // Add imported customers one by one
            for (const cust of importedCustomers) {
                // Simple duplicate check by name (optional)
                updated = addCustomer(updated, cust)
                count++
            }

            saveData(updated)
            setData(updated)
            toast.success(`Imported ${count} customers successfully`)
        } catch (error) {
            console.error(error)
            toast.error("Failed to import customers. Please check the file format.")
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Customer Management</h1>
                        <p className="text-muted-foreground">Manage your customer database</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImportFile}
                        />
                        <Button variant="outline" onClick={handleImportClick}>
                            <Upload className="mr-2 h-4 w-4" /> Import
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                All Customers ({data?.customers?.length || 0})
                            </CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or contact..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CustomerTable
                            customers={filteredCustomers}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onView={handleViewHistory}
                        />
                    </CardContent>
                </Card>
            </div>

            <CustomerFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                customer={selectedCustomer}
                onSubmit={handleFormSubmit}
            />

            <ServiceHistoryDialog
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                customer={selectedHistoryCustomer}
                jobs={data?.jobs.filter(j => j.customerId === selectedHistoryCustomer?.id) || []}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}
