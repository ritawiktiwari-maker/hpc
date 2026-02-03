"use client"

import { useEffect } from "react"
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
    onSubmit: (data: any) => void
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSubmit }: CustomerFormDialogProps) {
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

    useEffect(() => {
        if (customer) {
            form.reset({
                name: customer.name,
                address: customer.address,
                contactNumber: customer.contactNumber,
                email: customer.email || "",
                serviceType: customer.serviceType || "",
                contractStartDate: customer.contractStartDate || "",
                contractEndDate: customer.contractEndDate || "",
                contractAmount: customer.contractAmount || 0,
                frequency: customer.frequency || "",
                serviceDates: customer.serviceDates?.map(d => ({ date: d })) || [],
            })
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
                frequency: "",
                serviceDates: [],
            })
        }
    }, [customer, form, open])

    function handleSubmit(values: z.infer<typeof formSchema>) {
        // Flatten serviceDates from object array to string array
        const submissionData = {
            ...values,
            serviceDates: values.serviceDates?.map(d => d.date) || []
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
                                        <FormControl>
                                            <Input placeholder="e.g. 1 Year, AMC" {...field} />
                                        </FormControl>
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
                                        <FormControl>
                                            <Input placeholder="e.g. Monthly" {...field} />
                                        </FormControl>
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
                                                    const gst = form.getValues("gst") || 0
                                                    form.setValue("totalAmount", val + gst)
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
                                                    const gst = parseFloat(e.target.value) || 0
                                                    const val = form.getValues("contractAmount") || 0
                                                    form.setValue("totalAmount", val + gst)
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
                                    <FormLabel>Service Type (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Termite Control" {...field} />
                                    </FormControl>
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
