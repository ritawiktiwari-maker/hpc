import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/jobs/[id]/complete
 * Marks a visit (job) as COMPLETED.
 * Body (optional): { productsUsed: [{ productId, quantity }] }
 *   - If productsUsed is supplied, it records actual usage and
 *     updates employee & main stock accordingly.
 */
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id
        const body = await request.json().catch(() => ({}))
        const { productsUsed } = body // optional actual usage data

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the visit
            const visit = await tx.visit.findUnique({
                where: { id },
                include: {
                    productsUsed: { include: { product: true } },
                    assignedEmployee: true,
                }
            })

            if (!visit) throw new Error('Job not found')
            if (visit.status === 'COMPLETED') throw new Error('Job already completed')

            // 2. If actual usage provided, record it
            if (productsUsed && productsUsed.length > 0) {
                for (const usage of productsUsed) {
                    const product = await tx.product.findUnique({ where: { id: usage.productId } })
                    if (!product) continue

                    // Update or Create VisitProductUsage for accurate history
                    const existingUsage = await tx.visitProductUsage.findFirst({
                        where: { visitId: visit.id, productId: product.id }
                    })

                    if (existingUsage) {
                        await tx.visitProductUsage.update({
                            where: { id: existingUsage.id },
                            data: { quantity: usage.quantity }
                        })
                    } else {
                        await tx.visitProductUsage.create({
                            data: { visitId: visit.id, productId: product.id, quantity: usage.quantity }
                        })
                    }

                    // Record USED_IN_VISIT transaction
                    await tx.stockTransaction.create({
                        data: {
                            productId: product.id,
                            type: 'USED_IN_VISIT',
                            quantity: -usage.quantity,
                            referenceId: visit.id,
                            remarks: `Used in visit ${visit.billNumber || id}`,
                        }
                    })

                    // Decrement employee stock in hand
                    if (visit.assignedEmployeeId) {
                        await tx.employeeStock.updateMany({
                            where: {
                                employeeId: visit.assignedEmployeeId,
                                productId: product.id,
                            },
                            data: { quantity: { decrement: usage.quantity } }
                        })
                    }
                }
            }

            // 3. Mark visit as COMPLETED
            return await tx.visit.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    completionDate: new Date(),
                }
            })
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Job Complete Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to complete job' }, { status: 500 })
    }
}
