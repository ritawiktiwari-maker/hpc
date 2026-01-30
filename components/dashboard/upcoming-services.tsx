"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import { format, isAfter, isBefore, addDays, startOfDay, parseISO } from "date-fns"
import type { Job } from "@/lib/types"

interface UpcomingServicesProps {
    jobs: Job[]
}

export function UpcomingServices({ jobs }: UpcomingServicesProps) {
    const today = startOfDay(new Date())
    const nextTwoDays = addDays(today, 2)

    // Filter jobs with nextServiceDate within range [today, today+2]
    // Filter out duplicate customers if needed? Assuming one job per unique service for now, 
    // but a customer might have multiple jobs. We should show the specific job/service due.
    const upcoming = jobs
        .filter(job => {
            if (!job.nextServiceDate) return false
            const nextDate = parseISO(job.nextServiceDate)
            // Check if date is valid
            if (isNaN(nextDate.getTime())) return false

            // Check if date is today or in future AND before or on 2 days from now
            // Actually user said "coming in coming 2 days". 
            // So range: Today <= Date <= Today + 2
            return (
                (isAfter(nextDate, today) || nextDate.getTime() === today.getTime()) &&
                (isBefore(nextDate, nextTwoDays) || nextDate.getTime() === nextTwoDays.getTime())
            )
        })
        .sort((a, b) => new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime())

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Services
                </CardTitle>
                <CardDescription>Services due in the next 2 days</CardDescription>
            </CardHeader>
            <CardContent>
                {upcoming.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No upcoming services scheduled for the next 2 days.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcoming.map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium text-sm">{job.customerName}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground pl-5">
                                        {job.serviceType || "General Service"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="bg-background">
                                        {format(parseISO(job.nextServiceDate!), "dd MMM")}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
