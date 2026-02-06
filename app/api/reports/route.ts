
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const from = searchParams.get('from')
        const to = searchParams.get('to')

        const startDate = from ? startOfDay(new Date(from)) : startOfDay(new Date())
        const endDate = to ? endOfDay(new Date(to)) : endOfDay(new Date())

        // 1. Fetch Completed Services (Jobs/Visits)
        // Since we migrated to 'Contract' and 'Visit' model, 'Job' might be deprecated or mapped to Visit.
        // Let's check schema again. 'Job' entity doesn't exist in Prisma schema I saw earlier?
        // Wait, the schema I saw had 'Job' in 'AppData' types but NOT in Prisma Schema?
        // Let's re-read Prisma Schema carefully.

        // Prisma Schema has: Customer, Contract, Visit, Lead. 
        // It does NOT have 'Job'. The old 'Job' type was likely from the localStorage era.
        // The equivalent of a "Completed Service" is a 'Visit' with status 'COMPLETED'.

        const completedVisits = await prisma.visit.findMany({
            where: {
                status: 'COMPLETED',
                completionDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                contract: {
                    include: {
                        customer: true
                    }
                },
                assignedEmployee: true,
                productsUsed: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                completionDate: 'desc'
            }
        })

        // 2. Fetch Leads
        const leads = await prisma.lead.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                convertedCustomer: true,
                followedBy: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const totalLeads = leads.length
        const convertedLeads = leads.filter(l => l.convertedCustomerId).length
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

        return NextResponse.json({
            services: completedVisits.map(visit => ({
                id: visit.id,
                date: visit.completionDate,
                customerName: visit.contract.customer.name,
                customerAddress: visit.contract.customer.address,
                customerContact: visit.contract.customer.contactNumber,
                serviceType: visit.contract.serviceType,
                employeeName: visit.assignedEmployee?.name || 'Unassigned',
                productsUsed: visit.productsUsed.map(p => ({
                    productName: p.product.name,
                    quantity: p.quantity,
                    unit: p.product.unit
                }))
            })),
            leads: {
                total: totalLeads,
                converted: convertedLeads,
                conversionRate: conversionRate.toFixed(1),
                list: leads.map(lead => ({
                    id: lead.id,
                    name: lead.name,
                    mobile: lead.mobile,
                    source: lead.source,
                    status: lead.status,
                    createdAt: lead.createdAt,
                    convertedTo: lead.convertedCustomer?.name || null,
                    employeeName: lead.followedBy?.name || null
                }))
            }
        })

    } catch (error: any) {
        console.error("Reports API Error:", error)
        return NextResponse.json({ error: 'Failed to fetch reports', details: error.message }, { status: 500 })
    }
}
