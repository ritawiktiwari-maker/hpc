import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id
        const body = await request.json()
        const { status } = body // 'APPROVED' or 'REJECTED'

        if (status !== 'APPROVED' && status !== 'REJECTED') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const returnRequest = await tx.stockReturnRequest.findUnique({
                where: { id },
                include: { items: true, employee: true }
            })

            if (!returnRequest) {
                throw new Error('Return request not found')
            }

            if (returnRequest.status !== 'PENDING') {
                throw new Error('Request already processed')
            }

            if (status === 'APPROVED') {
                // 1. Process each item
                for (const item of returnRequest.items) {
                    // Update global product stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            quantityAvailable: { increment: item.quantity }
                        }
                    })

                    // Update employee stock in hand
                    // Note: EmployeeStock uses internal product id.
                    await tx.employeeStock.update({
                        where: {
                            employeeId_productId: {
                                employeeId: returnRequest.employeeId,
                                productId: item.productId
                            }
                        },
                        data: {
                            quantity: { decrement: item.quantity }
                        }
                    })

                    // Create stock transaction record
                    await tx.stockTransaction.create({
                        data: {
                            productId: item.productId,
                            type: 'RETURN_FROM_EMPLOYEE',
                            quantity: item.quantity,
                            referenceId: returnRequest.id,
                            remarks: `Returned by ${returnRequest.employee.name}`
                        }
                    })
                }
            }

            // Update request status
            return await tx.stockReturnRequest.update({
                where: { id },
                data: {
                    status,
                    resolvedAt: new Date()
                }
            })
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Stock Return Approval Error:", error)
        return NextResponse.json({ error: error.message || 'Failed to process return request' }, { status: 500 })
    }
}
