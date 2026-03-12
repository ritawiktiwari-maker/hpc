import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const today = startOfDay(new Date())
        const twoDaysFromNow = endOfDay(addDays(today, 2))

        // Fetch pending visits scheduled between today and 2 days from now
        const upcomingVisits = await prisma.visit.findMany({
            where: {
                status: 'PENDING',
                scheduledDate: {
                    gte: today,
                    lte: twoDaysFromNow
                }
            },
            include: {
                contract: {
                    include: {
                        customer: true
                    }
                },
                customer: true,
                assignedEmployee: true
            },
            orderBy: {
                scheduledDate: 'asc'
            }
        })

        // Map to the format expected by the frontend
        const formattedJobs = upcomingVisits.map(visit => ({
            id: visit.id,
            billNumber: visit.billNumber || (visit.contract ? visit.contract.id.split('-')[0].toUpperCase() : 'DIRECT'),
            customerName: visit.contract?.customer.name || visit.customer?.name || 'Direct Visit',
            customerContact: visit.contract?.customer.contactNumber || visit.customer?.contactNumber || '',
            employeeName: visit.assignedEmployee?.name || 'Unassigned',
            serviceType: visit.serviceType || visit.contract?.serviceType || 'Direct Visit',
            scheduledDate: visit.scheduledDate.toISOString(),
            nextServiceDate: visit.scheduledDate.toISOString(), // Mapping scheduledDate to nextServiceDate for the UpcomingServices component
            status: visit.status.toLowerCase()
        }))

        return NextResponse.json(formattedJobs)
    } catch (error: any) {
        console.error("Upcoming Jobs API Error:", error)
        return NextResponse.json({ error: 'Failed to fetch upcoming jobs' }, { status: 500 })
    }
}
