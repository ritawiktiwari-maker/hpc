import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Fetch all pending visits (equivalent to running orders/jobs)
        const pendingJobs = await prisma.visit.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                customer: true,
                contract: {
                    include: {
                        customer: true
                    }
                },
                assignedEmployee: true
            },
            orderBy: {
                scheduledDate: 'asc'
            }
        })

        // Map to a common job format for frontend
        const formattedJobs = pendingJobs.map(visit => ({
            id: visit.id,
            billNumber: visit.billNumber || (visit.contract ? visit.contract.id.split('-')[0].toUpperCase() : 'DIRECT'),
            customerName: visit.customer?.name || visit.contract?.customer.name || 'Direct Visit',
            customerContact: visit.customer?.contactNumber || visit.contract?.customer.contactNumber || '',
            employeeName: visit.assignedEmployee?.name || 'Unassigned',
            employeeId: visit.assignedEmployee?.employeeId || '',
            serviceType: visit.serviceType || visit.contract?.serviceType || 'General Service',
            scheduledDate: visit.scheduledDate,
            status: visit.status
        }))

        return NextResponse.json(formattedJobs)
    } catch (error: any) {
        console.error("Pending Jobs API Error:", error)
        return NextResponse.json({ error: 'Failed to fetch pending jobs' }, { status: 500 })
    }
}
