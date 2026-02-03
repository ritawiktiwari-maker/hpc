"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { Employee } from "@/lib/types" // Fallback to types, but ideally we fetch from API

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    address: z.string().optional(),
    source: z.string().optional(),
    followedById: z.string().optional(),
})

interface LeadFormProps {
    onSuccess: () => void
}

export function LeadFormDialog({ onSuccess }: LeadFormProps) {
    const [open, setOpen] = useState(false)
    const [employees, setEmployees] = useState<any[]>([]) // Using any for now until we have Employee API type

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch('/api/employees')
                if (res.ok) {
                    const data = await res.json()
                    setEmployees(data)
                }
            } catch (error) {
                console.error("Failed to fetch employees", error)
            }
        }
        if (open) {
            fetchEmployees()
        }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            mobile: "",
            address: "",
            source: "",
            followedById: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const text = await response.text()
                console.error("API Error Response:", text)
                try {
                    const errorData = JSON.parse(text)
                    throw new Error(errorData.details || "Failed to create lead")
                } catch (e) {
                    throw new Error("Server Error: Check console for details")
                }
            }

            toast.success("Lead created successfully")
            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to create lead")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add New Lead</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription>
                        Enter the details of the potential customer.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mobile Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="9876543210" {...field} />
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
                                        <Input placeholder="City, Area" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Source" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Website">Website</SelectItem>
                                            <SelectItem value="Referral">Referral</SelectItem>
                                            <SelectItem value="Social Media">Social Media</SelectItem>
                                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                                            <SelectItem value="Employee">Employee</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch("source") === "Employee" && (
                            <FormField
                                control={form.control}
                                name="followedById"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Employee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Employee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id}>
                                                        {employee.name} ({employee.employeeId})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {/* Followed By Employee field would go here once we have the Employee API connected */}
                        <DialogFooter>
                            <Button type="submit">Save Lead</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
