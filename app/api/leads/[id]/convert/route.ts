import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const leadId = params.id

        // 1. Get the lead
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        })

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        if (lead.status === 'CONVERTED') {
            return NextResponse.json({ error: 'Lead already converted' }, { status: 400 })
        }

        // 2. Create the Customer
        // Use transaction to ensure both happen or neither
        const result = await prisma.$transaction(async (tx: any) => {
            const customer = await tx.customer.create({
                data: {
                    name: lead.name,
                    contactNumber: lead.mobile,
                    address: lead.address || 'Address Pending',
                }
            })

            // 3. Update lead status and link to customer
            await tx.lead.update({
                where: { id: leadId },
                data: {
                    status: 'CONVERTED',
                    convertedCustomerId: customer.id
                }
            })

            return customer
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to convert lead' }, { status: 500 })
    }
}
