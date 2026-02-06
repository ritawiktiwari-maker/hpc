import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id
        const body = await request.json()
        const { name, contactNumber, address, email } = body

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                contactNumber,
                address,
                email
            }
        })
        return NextResponse.json(customer)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id

        // Use transaction to delete related records first (Cascading delete)
        await prisma.$transaction(async (tx) => {
            // 1. Find contracts to get their IDs
            const contracts = await tx.contract.findMany({
                where: { customerId: id },
                select: { id: true }
            })
            const contractIds = contracts.map(c => c.id)

            // 2. Delete Visits associated with these contracts
            if (contractIds.length > 0) {
                await tx.visit.deleteMany({
                    where: { contractId: { in: contractIds } }
                })
            }

            // 3. Delete Contracts
            await tx.contract.deleteMany({
                where: { customerId: id }
            })

            // 4. Unlink Leads (set convertedCustomerId to null)
            await tx.lead.updateMany({
                where: { convertedCustomerId: id },
                data: { convertedCustomerId: null, status: "NEW" } // Optionally reset status or keep as CONVERTED? Keeping lead but unlinking.
            })

            // 5. Finally delete the Customer
            await tx.customer.delete({
                where: { id }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
    }
}
