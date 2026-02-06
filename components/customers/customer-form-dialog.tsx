"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Customer } from "@/lib/types"

// Add Lead type interface locally if needed, or proper import
interface InitialCustomerData {
    name?: string
    contactNumber?: string
    address?: string
    leadId?: string
}
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const TERMS_OPTIONS = [
    "1 Year",
    "2 Years",
    "3 Years",
    "5 Years",
    "AMC",
    "Single Service"
]

const FREQUENCY_OPTIONS = [
    "Daily excluding Sunday and holidays",
    "Alternate day",
    "Thrice in a week",
    "Weekly",
    "Fortnightly",
    "Monthly",
    "Alternate Month",
    "Quarterly",
    "3 Services @ 4 month",
    "6 Services @ 4 Month",
    "Initial treatment followed by 1 year's service warranty",
    "Initial treatment followed by 2 years' service warranty",
    "Initial treatment followed by 3 years' service warranty",
    "Initial treatment followed by 5 years' service warranty",
    "Initial treatment followed by 10 years' service warranty",
    "Single Service",
    "As & when required"
]

const SERVICE_TYPE_OPTIONS = [
    "Household Pest Management",
    "Cockroach Management Solutions",
    "Ants Management Solutions",
    "Termite Management Solutions",
    "Wood borer Management",
    "Termite Management Solutions (Pre-construction)",
    "Termite Management Solutions (Post-construction)",
    "Bee safe Service",
    "Snake Management Solutions",
    "Night Service for cockroaches",
    "Weed Management Solutions",
    "Fly Management Solutions",
    "Mosquito Management Solutions: Indoor Residual Spray",
    "Mosquito Management Solutions: Anti-larva Treatment",
    "Mosquito Management Solutions: Thermal Fogging",
    "Mosquito Management Solutions: Cold fogging",
    "General Spray",
    "Bed Bugs Management Solutions",
    "Rodent Mangement Solutions",
    "Peri gaurd Service",
    "Microbial disinfection Service"
]

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    serviceType: z.string().optional(),
    contractStartDate: z.string().optional(),
    contractEndDate: z.string().optional(),
    contractAmount: z.coerce.number().optional(),
    gst: z.coerce.number().optional(),
    totalAmount: z.coerce.number().optional(),
    terms: z.string().optional(),
    frequency: z.string().optional(),
    serviceDates: z.array(z.object({ date: z.string() })).max(10).optional(),
})

interface CustomerFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
    initialData?: InitialCustomerData | null // For pre-filling from Lead
    onSubmit: (data: any) => void
}

export function CustomerFormDialog({ open, onOpenChange, customer, initialData, onSubmit }: CustomerFormDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            address: "",
            contactNumber: "",
            email: "",
            serviceType: "",
            contractStartDate: "",
            contractEndDate: "",
            contractAmount: 0,
            gst: 0,
            totalAmount: 0,
            terms: "",
            frequency: "",
            serviceDates: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "serviceDates",
    })

    const [isCustomTerms, setIsCustomTerms] = useState(false)
    const [isCustomFrequency, setIsCustomFrequency] = useState(false)
    const [isCustomServiceType, setIsCustomServiceType] = useState(false)

    useEffect(() => {
        if (customer) {
            // Check if we have nested contracts (Prisma structure) or flat properties (Types/Legacy)
            // @ts-ignore - We are handling potential structure mismatch dynamically
            const activeContract = customer.contracts && customer.contracts.length > 0 ? customer.contracts[0] : customer;

            form.reset({
                name: customer.name,
                address: customer.address,
                contactNumber: customer.contactNumber,
                email: customer.email || "",
                // Use activeContract for these fields
                serviceType: activeContract.serviceType || customer.serviceType || "",
                contractStartDate: activeContract.startDate ? new Date(activeContract.startDate).toISOString().split('T')[0] : (activeContract.contractStartDate || ""),
                contractEndDate: activeContract.endDate ? new Date(activeContract.endDate).toISOString().split('T')[0] : (activeContract.contractEndDate || ""),
                contractAmount: activeContract.contractValue || activeContract.contractAmount || 0,
                gst: activeContract.gst || 0,
                totalAmount: activeContract.totalAmount || 0,
                terms: activeContract.terms || "",
                frequency: activeContract.frequency || "",
                // Handle visits/serviceDates if they exist on contract
                serviceDates: activeContract.visits ? activeContract.visits.map((v: any) => ({ date: v.scheduledDate ? new Date(v.scheduledDate).toISOString().split('T')[0] : v.date })) : (customer.serviceDates?.map(d => ({ date: d })) || []),
            })

            const termsVal = activeContract.terms || "";
            const freqVal = activeContract.frequency || "";
            const typeVal = activeContract.serviceType || "";

            setIsCustomTerms(termsVal ? !TERMS_OPTIONS.includes(termsVal) : false)
            setIsCustomFrequency(freqVal ? !FREQUENCY_OPTIONS.includes(freqVal) : false)
            setIsCustomServiceType(typeVal ? !SERVICE_TYPE_OPTIONS.includes(typeVal) : false)
        } else if (initialData) {
            // Pre-fill from Lead
            form.reset({
                name: initialData.name || "",
                address: initialData.address || "",
                contactNumber: initialData.contactNumber || "",
                email: "",
                serviceType: "",
                contractStartDate: "",
                contractEndDate: "",
                contractAmount: 0,
                gst: 0,
                totalAmount: 0,
                terms: "",
                frequency: "",
                serviceDates: [],
            })
            // Reset custom flags
            setIsCustomTerms(false)
            setIsCustomFrequency(false)
            setIsCustomServiceType(false)
        } else {
            form.reset({
                name: "",
                address: "",
                contactNumber: "",
                email: "",
                serviceType: "",
                contractStartDate: "",
                contractEndDate: "",
                contractAmount: 0,
                gst: 0,
                totalAmount: 0,
                terms: "",
                frequency: "",
                serviceDates: [],
            })
            setIsCustomTerms(false)
            setIsCustomFrequency(false)
            setIsCustomServiceType(false)
        }
    }, [customer, initialData, form, open])

    function handleSubmit(values: z.infer<typeof formSchema>) {
        // Flatten serviceDates from object array to string array
        const submissionData = {
            ...values,
            serviceDates: values.serviceDates?.map(d => d.date) || [],
            leadId: initialData?.leadId // Pass the lead ID if we are converting
        }
        onSubmit(submissionData)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
                    <DialogDescription>
                        {customer ? "Update customer details." : "Add a new customer to your database."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contactNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="9876543210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contractStartDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contract Start</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contractEndDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contract End</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="terms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Terms</FormLabel>
                                        <div className="space-y-2">
                                            <Select
                                                value={isCustomTerms ? "Other" : (TERMS_OPTIONS.includes(field.value || "") ? field.value : (field.value ? "Other" : ""))}
                                                onValueChange={(val) => {
                                                    if (val === "Other") {
                                                        setIsCustomTerms(true)
                                                        field.onChange("")
                                                    } else {
                                                        setIsCustomTerms(false)
                                                        field.onChange(val)
                                                    }
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Terms" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TERMS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {isCustomTerms && (
                                                <Input
                                                    placeholder="Specify remark..."
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="frequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency</FormLabel>
                                        <div className="space-y-2">
                                            <Select
                                                value={isCustomFrequency ? "Other" : (FREQUENCY_OPTIONS.includes(field.value || "") ? field.value : (field.value ? "Other" : ""))}
                                                onValueChange={(val) => {
                                                    if (val === "Other") {
                                                        setIsCustomFrequency(true)
                                                        field.onChange("")
                                                    } else {
                                                        setIsCustomFrequency(false)
                                                        field.onChange(val)
                                                    }
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {FREQUENCY_OPTIONS.map(opt => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {isCustomFrequency && (
                                                <Input
                                                    placeholder="Specify remark..."
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="contractAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Basic Amount"
                                                {...field}
                                                onChange={e => {
                                                    field.onChange(e)
                                                    const val = parseFloat(e.target.value) || 0
                                                    const gstParam = form.getValues("gst") || 0
                                                    // GST is a percentage (e.g., 18)
                                                    const total = val + (val * gstParam / 100)
                                                    form.setValue("totalAmount", Math.round(total * 100) / 100)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gst"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GST</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Tax"
                                                {...field}
                                                onChange={e => {
                                                    field.onChange(e)
                                                    const gstParam = parseFloat(e.target.value) || 0
                                                    const val = form.getValues("contractAmount") || 0
                                                    // GST is a percentage
                                                    const total = val + (val * gstParam / 100)
                                                    form.setValue("totalAmount", Math.round(total * 100) / 100)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total</FormLabel>
                                        <FormControl>
                                            <Input type="number" readOnly {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FormLabel>Service Dates (Max 10)</FormLabel>
                                {fields.length < 10 && (
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ date: "" })}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Date
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`serviceDates.${index}.date`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Type</FormLabel>
                                    <div className="space-y-2">
                                        <Select
                                            value={isCustomServiceType ? "Other" : (SERVICE_TYPE_OPTIONS.includes(field.value || "") ? field.value : (field.value ? "Other" : ""))}
                                            onValueChange={(val) => {
                                                if (val === "Other") {
                                                    setIsCustomServiceType(true)
                                                    field.onChange("")
                                                } else {
                                                    setIsCustomServiceType(false)
                                                    field.onChange(val)
                                                }
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Service Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SERVICE_TYPE_OPTIONS.map(opt => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {isCustomServiceType && (
                                            <Input
                                                placeholder="Specify service type..."
                                                {...field}
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Full address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{customer ? "Update" : "Add Customer"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
