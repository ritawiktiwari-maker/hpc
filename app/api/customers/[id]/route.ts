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
        const {
            name, contactNumber, address, email,
            serviceType, frequency, contractStartDate, contractEndDate,
            contractAmount, gst, totalAmount, terms, serviceDates
        } = body

        const customer = await prisma.$transaction(async (tx) => {
            // 1. Update Customer base details
            const updatedCustomer = await tx.customer.update({
                where: { id },
                data: {
                    name,
                    contactNumber,
                    address,
                    email,
                    serviceType: serviceType || undefined,
                    frequency: frequency || undefined,
                }
            })

            // 2. Update the active/first contract if form sent contract details
            const existingContract = await tx.contract.findFirst({
                where: { customerId: id }
            })

            if (existingContract) {
                await tx.contract.update({
                    where: { id: existingContract.id },
                    data: {
                        ...(serviceType && { serviceType }),
                        ...(frequency && { frequency }),
                        ...(terms && { terms }),
                        ...(contractStartDate && { startDate: new Date(contractStartDate) }),
                        ...(contractEndDate && { endDate: new Date(contractEndDate) }),
                        ...(contractAmount !== undefined && { contractValue: parseFloat(contractAmount) }),
                        ...(gst !== undefined && { gst: parseFloat(gst) }),
                        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
                    }
                })

                // 3. Recreate PENDING visits based on new serviceDates
                if (serviceDates && Array.isArray(serviceDates)) {
                    // Delete existing PENDING visits for this contract
                    await tx.visit.deleteMany({
                        where: {
                            contractId: existingContract.id,
                            status: "PENDING"
                        }
                    })

                    // Create new PENDING visits
                    const validDates = (serviceDates || [])
                        .map((date: string) => new Date(date))
                        .filter((d: Date) => !isNaN(d.getTime()))

                    if (validDates.length > 0) {
                        await tx.visit.createMany({
                            data: validDates.map((d: Date) => ({
                                contractId: existingContract.id,
                                customerId: id,
                                scheduledDate: d,
                                status: "PENDING"
                            }))
                        })
                    }
                }
            }

            return updatedCustomer
        })

        return NextResponse.json(customer)
    } catch (error: any) {
        console.error("Customer Update Error:", error)
        return NextResponse.json({ error: 'Failed to update customer', details: error.message }, { status: 500 })
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
