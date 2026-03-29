"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { ArrowRight, UserCheck, Search, Phone, Mail, MapPin, MessageSquare, Globe, ChevronDown, Eye } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Lead {
    id: string
    name: string
    mobile: string
    email?: string | null
    address: string | null
    source: string | null
    serviceInterest?: string | null
    message?: string | null
    status: "NEW" | "CONTACTED" | "CONVERTED" | "LOST"
    isViewed?: boolean
    followedBy?: { name: string } | null
    createdAt: string
}

interface LeadTableProps {
    leads: Lead[]
    onUpdate: () => void
    onConvert?: (lead: Lead) => void
}

export function LeadTable({ leads, onUpdate, onConvert }: LeadTableProps) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [sourceFilter, setSourceFilter] = useState<string>("ALL")
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    const unviewedCount = leads.filter(l => l.isViewed === false).length

    const handleConvert = async (leadId: string) => {
        try {
            const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'POST' })
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

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed to update status')
            toast.success(`Lead status updated to ${newStatus}`)
            onUpdate()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleViewLead = async (lead: Lead) => {
        setSelectedLead(lead)
        // Mark as viewed if not already
        if (!lead.isViewed) {
            try {
                await fetch(`/api/leads/${lead.id}/view`, { method: 'POST' })
                onUpdate() // Refresh to remove badge
            } catch (e) {
                console.error("Failed to mark as viewed:", e)
            }
        }
    }

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = !search ||
            lead.name.toLowerCase().includes(search.toLowerCase()) ||
            lead.mobile.includes(search) ||
            (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()))
        const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter
        const matchesSource = sourceFilter === "ALL" || lead.source === sourceFilter
        return matchesSearch && matchesStatus && matchesSource
    })

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, mobile, or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Sources</SelectItem>
                        <SelectItem value="Website">
                            <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Website
                            </span>
                        </SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="CONVERTED">Converted</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Unviewed banner */}
            {unviewedCount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                    <div className="relative">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-blue-800">
                        {unviewedCount} new website {unviewedCount === 1 ? 'enquiry' : 'enquiries'} - click to view
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="hidden sm:table-cell">Source</TableHead>
                            <TableHead className="hidden md:table-cell">Service Interest</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow
                                    key={lead.id}
                                    className={`cursor-pointer table-row-hover transition-colors ${!lead.isViewed ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => handleViewLead(lead)}
                                >
                                    {/* NEW badge indicator */}
                                    <TableCell className="w-8 px-2">
                                        {!lead.isViewed && (
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {lead.name}
                                            {!lead.isViewed && (
                                                <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 animate-pulse">
                                                    NEW
                                                </Badge>
                                            )}
                                        </div>
                                        {lead.address && (
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.address}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <a href={`tel:${lead.mobile}`} className="flex items-center gap-1 text-sm hover:text-primary" onClick={e => e.stopPropagation()}>
                                            <Phone className="h-3 w-3" />
                                            {lead.mobile}
                                        </a>
                                        {lead.email && (
                                            <div className="text-xs text-muted-foreground">{lead.email}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {lead.source === 'Website' ? (
                                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 gap-1 text-[10px]">
                                                <Globe className="h-3 w-3" /> Website
                                            </Badge>
                                        ) : (
                                            <span className="text-sm">{lead.source || "-"}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm">
                                        {lead.serviceInterest || "-"}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                        {format(new Date(lead.createdAt), "dd MMM yyyy")}
                                    </TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        {lead.status !== 'CONVERTED' ? (
                                            <Select
                                                value={lead.status}
                                                onValueChange={(val) => handleStatusChange(lead.id, val)}
                                            >
                                                <SelectTrigger className="h-7 w-28 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NEW">New</SelectItem>
                                                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                                                    <SelectItem value="LOST">Lost</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge className="bg-green-100 text-green-700">Converted</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="gap-1 text-xs h-7"
                                                onClick={() => handleViewLead(lead)}
                                            >
                                                <Eye className="w-3 h-3" />
                                            </Button>
                                            {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="gap-1 text-xs h-7"
                                                    onClick={() => onConvert ? onConvert(lead) : handleConvert(lead.id)}
                                                >
                                                    Convert <ArrowRight className="w-3 h-3" />
                                                </Button>
                                            )}
                                            {lead.status === 'CONVERTED' && (
                                                <Button size="sm" variant="ghost" disabled className="gap-1 text-green-600 text-xs h-7">
                                                    <UserCheck className="w-3 h-3" /> Customer
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Lead Detail Dialog */}
            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Lead Details
                            {selectedLead?.source === 'Website' && (
                                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 gap-1 text-[10px]">
                                    <Globe className="h-3 w-3" /> Website Enquiry
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedLead && format(new Date(selectedLead.createdAt), "dd MMM yyyy, hh:mm a")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLead && (
                        <div className="space-y-4">
                            {/* Contact Info */}
                            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {selectedLead.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{selectedLead.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Status: <Badge variant="secondary" className="text-[10px] ml-1">{selectedLead.status}</Badge>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <a href={`tel:${selectedLead.mobile}`} className="flex items-center gap-2 hover:text-primary">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {selectedLead.mobile}
                                    </a>
                                    {selectedLead.email && (
                                        <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 hover:text-primary">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {selectedLead.email}
                                        </a>
                                    )}
                                    {selectedLead.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            {selectedLead.address}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Service Interest */}
                            {selectedLead.serviceInterest && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service Interested In</p>
                                    <p className="text-sm font-medium">{selectedLead.serviceInterest}</p>
                                </div>
                            )}

                            {/* Message */}
                            {selectedLead.message && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Message</p>
                                    <div className="p-3 bg-muted/30 rounded-lg text-sm border-l-2 border-primary/30">
                                        {selectedLead.message}
                                    </div>
                                </div>
                            )}

                            {/* Source & Follow-up */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Source</p>
                                    <p className="font-medium">{selectedLead.source || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Followed By</p>
                                    <p className="font-medium">{selectedLead.followedBy?.name || "Unassigned"}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <a href={`tel:${selectedLead.mobile}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2" size="sm">
                                        <Phone className="h-4 w-4" /> Call
                                    </Button>
                                </a>
                                {selectedLead.status !== 'CONVERTED' && selectedLead.status !== 'LOST' && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            className="flex-1 gap-2"
                                            size="sm"
                                            onClick={() => {
                                                handleStatusChange(selectedLead.id, 'CONTACTED')
                                                setSelectedLead(null)
                                            }}
                                        >
                                            Mark Contacted
                                        </Button>
                                        <Button
                                            className="flex-1 gap-2"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedLead(null)
                                                if (onConvert) onConvert(selectedLead)
                                            }}
                                        >
                                            Convert <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
