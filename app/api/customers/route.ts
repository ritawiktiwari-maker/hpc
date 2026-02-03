import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
            include: { contracts: true } // Include contracts if needed
        })
        return NextResponse.json(customers)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name, contactNumber, address, email,
            serviceType, frequency, contractStartDate, contractEndDate,
            contractAmount, gst, totalAmount, terms, serviceDates
        } = body

        // Create Customer with nested Contract and Visits
        const customer = await prisma.customer.create({
            data: {
                name,
                contactNumber,
                address,
                email,
                contracts: {
                    create: {
                        serviceType: serviceType || "General",
                        frequency: frequency || "Once",
                        startDate: contractStartDate ? new Date(contractStartDate) : new Date(),
                        endDate: contractEndDate ? new Date(contractEndDate) : new Date(),
                        contractValue: parseFloat(contractAmount || 0),
                        gst: parseFloat(gst || 0),
                        totalAmount: parseFloat(totalAmount || 0),
                        terms: terms || "",
                        visits: {
                            create: (serviceDates || []).map((date: string) => ({
                                scheduledDate: new Date(date),
                                status: "PENDING"
                            }))
                        }
                    }
                }
            },
            include: {
                contracts: true
            }
        })

        return NextResponse.json(customer)
    } catch (error: any) {
        console.error("Customer Create Error:", error)
        return NextResponse.json({ error: 'Failed to create customer', details: error.message }, { status: 500 })
    }
}
