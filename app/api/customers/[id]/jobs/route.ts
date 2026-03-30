import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const customerId = params.id

    try {
        const visits = await prisma.visit.findMany({
            where: {
                customerId: customerId
            },
            include: {
                assignedEmployee: true,
                productsUsed: {
                    include: {
                        product: true
                    }
                },
                contract: true
            },
            orderBy: {
                scheduledDate: 'desc'
            }
        })

        // Map Visit to Job type expected by frontend
        const jobs = visits.map(visit => ({
            id: visit.id,
            billNumber: visit.billNumber || (visit.contract ? visit.contract.id.split('-')[0].toUpperCase() : 'N/A'),
            customerId: visit.customerId,
            customerName: '', // Frontend has this info
            employeeId: visit.assignedEmployee?.id || '',
            employeeName: visit.assignedEmployee?.name || 'Unassigned',
            jobDate: visit.scheduledDate.toISOString().split('T')[0],
            productsAssigned: visit.productsUsed.map(pu => ({
                productId: pu.product.productId || pu.product.id,
                productName: pu.product.name,
                quantityGiven: pu.quantity,
                unit: pu.product.unit
            })),
            amount: visit.billAmount || 0,
            serviceType: visit.serviceType || visit.contract?.serviceType || 'Direct Visit',
            nextServiceDate: '', // Not tracked in Visit model yet
            status: visit.status.toLowerCase(), // 'PENDING' -> 'pending', 'COMPLETED' -> 'completed'
            remarks: visit.remarks || '',
            createdAt: visit.createdAt.toISOString()
        }))

        return NextResponse.json(jobs)
    } catch (error: any) {
        console.error("Customer Jobs API Error:", error)
        return NextResponse.json({ error: 'Failed to fetch customer jobs' }, { status: 500 })
    }
}
