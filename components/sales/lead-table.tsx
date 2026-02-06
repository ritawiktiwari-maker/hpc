"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, UserCheck } from "lucide-react"
import { toast } from "sonner"

// Defined type locally for now, ideally shared
interface Lead {
    id: string
    name: string
    mobile: string
    address: string | null
    source: string | null
    status: "NEW" | "CONTACTED" | "CONVERTED" | "LOST"
    followedBy?: { name: string } | null
    createdAt: string
}

interface LeadTableProps {
    leads: Lead[]
    onUpdate: () => void
    onConvert?: (lead: Lead) => void // New prop
}

export function LeadTable({ leads, onUpdate, onConvert }: LeadTableProps) {

    const handleConvert = async (leadId: string) => {
        // Fallback if onConvert logic isn't passed (legacy)
        try {
            const res = await fetch(`/api/leads/${leadId}/convert`, {
                method: 'POST'
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to convert')
            }
            toast.success("Lead converted to Customer successfully!")
            onUpdate()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Followed By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No leads found. Add one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">
                                    {lead.name}
                                    <div className="text-xs text-muted-foreground">{lead.address}</div>
                                </TableCell>
                                <TableCell>{lead.mobile}</TableCell>
                                <TableCell>{lead.source || "-"}</TableCell>
                                <TableCell>{lead.followedBy?.name || "Unassigned"}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        lead.status === "CONVERTED" ? "default" :
                                            lead.status === "LOST" ? "destructive" : "secondary"
                                    }>
                                        {lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {lead.status !== 'CONVERTED' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => onConvert ? onConvert(lead) : handleConvert(lead.id)}
                                        >
                                            Convert <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    )}
                                    {lead.status === 'CONVERTED' && (
                                        <Button size="sm" variant="ghost" disabled className="gap-2 text-green-600">
                                            <UserCheck className="w-4 h-4" /> Customer
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
