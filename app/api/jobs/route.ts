import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const countOnly = searchParams.get('countOnly')
        const employeeId = searchParams.get('employeeId')
        const status = searchParams.get('status')

        // Fast count-only path for dashboard
        if (countOnly === 'true') {
            const count = await prisma.visit.count()
            return NextResponse.json({ count })
        }

        // Build where clause based on filters
        const where: any = {}
        if (employeeId) {
            const employee = await prisma.employee.findUnique({ where: { employeeId } })
            if (employee) {
                where.assignedEmployeeId = employee.id
            }
        }
        if (status) {
            where.status = status.toUpperCase()
        }

        const jobs = await prisma.visit.findMany({
            where,
            include: {
                customer: true,
                contract: true,
                assignedEmployee: true,
                productsUsed: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(jobs)
    } catch (error: any) {
        console.error("Jobs API GET Error:", error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            billNumber,
            customerId,
            employeeId,
            jobDate,
            productsAssigned,
            amount,
            serviceType,
            nextServiceDate,
            remarks
        } = body

        // Check if employee is active
        const targetEmployee = await prisma.employee.findUnique({
            where: { employeeId }
        })

        if (!targetEmployee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        if (!targetEmployee.isActive) {
            return NextResponse.json({ error: 'Cannot assign job to an inactive employee' }, { status: 400 })
        }

        // Start a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Lookup employee once and reuse
            const employeeDbId = targetEmployee.id

            // 1. Create the Visit (Job)
            const visit = await tx.visit.create({
                data: {
                    billNumber: billNumber || null,
                    customerId: customerId || null,
                    assignedEmployeeId: employeeDbId,
                    scheduledDate: new Date(jobDate),
                    status: 'PENDING',
                    serviceType: serviceType || null,
                    remarks: remarks || null,
                    billAmount: parseFloat(amount || 0),
                }
            })

            // 2. Batch-fetch all products in one query instead of N individual lookups
            const productIds = productsAssigned.map((item: any) => item.productId)
            const dbProducts = await tx.product.findMany({
                where: { productId: { in: productIds } }
            })

            const productMap = new Map(dbProducts.map(p => [p.productId, p]))

            // 3. Process each product (validation + writes)
            for (const item of productsAssigned) {
                const dbProduct = productMap.get(item.productId)

                if (!dbProduct) {
                    throw new Error(`Product ${item.productId} not found`)
                }

                if (dbProduct.quantityAvailable < item.quantityGiven) {
                    throw new Error(`Insufficient stock for ${dbProduct.name}`)
                }

                // Create VisitProductUsage, Stock Transaction, update product, and upsert employee stock
                await Promise.all([
                    tx.visitProductUsage.create({
                        data: {
                            visitId: visit.id,
                            productId: dbProduct.id,
                            quantity: item.quantityGiven,
                        }
                    }),
                    tx.stockTransaction.create({
                        data: {
                            productId: dbProduct.id,
                            type: 'ASSIGN_TO_EMPLOYEE',
                            quantity: -item.quantityGiven,
                            referenceId: visit.id,
                            remarks: `Assigned for Bill ${billNumber}`
                        }
                    }),
                    tx.product.update({
                        where: { id: dbProduct.id },
                        data: {
                            quantityAvailable: { decrement: item.quantityGiven }
                        }
                    }),
                    tx.employeeStock.upsert({
                        where: {
                            employeeId_productId: {
                                employeeId: employeeDbId,
                                productId: dbProduct.id
                            }
                        },
                        update: {
                            quantity: { increment: item.quantityGiven }
                        },
                        create: {
                            employeeId: employeeDbId,
                            productId: dbProduct.id,
                            quantity: item.quantityGiven
                        }
                    }),
                ])
            }

            return visit
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Job Assignment Error:", error)
        return NextResponse.json({ error: error.message || 'Failed to assign job' }, { status: 500 })
    }
}
