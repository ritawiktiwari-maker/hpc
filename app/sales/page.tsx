"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout" // Assuming this component exists or similar layout
import { LeadFormDialog } from "@/components/sales/lead-form"
import { LeadTable } from "@/components/sales/lead-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog" // Import
import { toast } from "sonner"

export default function SalesPage() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [convertingLead, setConvertingLead] = useState<any>(null)
    const [isConvertOpen, setIsConvertOpen] = useState(false)

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads')
            if (res.ok) {
                const data = await res.json()
                setLeads(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleConvertClick = (lead: any) => {
        setConvertingLead({
            name: lead.name,
            contactNumber: lead.mobile,
            address: lead.address,
            leadId: lead.id
        })
        setIsConvertOpen(true)
    }

    const handleCustomerSubmit = async (data: any) => {
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.details || "Failed to create customer")
            }

            toast.success("Customer created and lead converted successfully")
            setConvertingLead(null)
            setIsConvertOpen(false)
            fetchLeads() // Refresh leads to show updated status
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Sales & Leads</h1>
                        <p className="text-muted-foreground">Manage potential customers and track conversions.</p>
                    </div>
                    <LeadFormDialog onSuccess={fetchLeads} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{leads.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Converted</CardTitle>
                            {/* Icon */}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {leads.filter((l: any) => l.status === 'CONVERTED').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            {/* Icon */}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {leads.filter((l: any) => l.status === 'NEW').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Leads</CardTitle>
                        <CardDescription>
                            List of all inquiries and their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Loading leads...</div>
                        ) : (
                            <LeadTable
                                leads={leads}
                                onUpdate={fetchLeads}
                                onConvert={handleConvertClick}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Conversion Dialog */}
                <CustomerFormDialog
                    open={isConvertOpen}
                    onOpenChange={setIsConvertOpen}
                    customer={null}
                    initialData={convertingLead}
                    onSubmit={handleCustomerSubmit}
                />
            </div>
        </AdminLayout>
    )
}
