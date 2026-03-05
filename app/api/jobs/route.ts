import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const jobs = await prisma.visit.findMany({
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
            // 1. Create the Visit (Job)
            const visit = await tx.visit.create({
                data: {
                    billNumber: billNumber || null,
                    customerId: customerId || null,
                    assignedEmployeeId: (await tx.employee.findUnique({ where: { employeeId } }))?.id,
                    scheduledDate: new Date(jobDate),
                    status: 'PENDING',
                    serviceType: serviceType || null,
                    remarks: remarks || null,
                    billAmount: parseFloat(amount || 0),
                }
            })

            // 2. Process each product
            for (const item of productsAssigned) {
                const dbProduct = await tx.product.findUnique({
                    where: { productId: item.productId }
                })

                if (!dbProduct) {
                    throw new Error(`Product ${item.productId} not found`)
                }

                if (dbProduct.quantityAvailable < item.quantityGiven) {
                    throw new Error(`Insufficient stock for ${dbProduct.name}`)
                }

                // 2a. Create VisitProductUsage (the join record that makes products appear on the visit)
                await tx.visitProductUsage.create({
                    data: {
                        visitId: visit.id,
                        productId: dbProduct.id,
                        quantity: item.quantityGiven,
                    }
                })

                // 2b. Create Stock Transaction
                await tx.stockTransaction.create({
                    data: {
                        productId: dbProduct.id,
                        type: 'ASSIGN_TO_EMPLOYEE',
                        quantity: -item.quantityGiven, // Deduction from main stock
                        referenceId: visit.id,
                        remarks: `Assigned for Bill ${billNumber}`
                    }
                })

                // 2c. Update Product main stock
                await tx.product.update({
                    where: { id: dbProduct.id },
                    data: {
                        quantityAvailable: { decrement: item.quantityGiven }
                    }
                })

                // 2d. Update Employee Stock in hand
                const employeeIdInDb = (await tx.employee.findUnique({ where: { employeeId } }))?.id
                if (employeeIdInDb) {
                    await tx.employeeStock.upsert({
                        where: {
                            employeeId_productId: {
                                employeeId: employeeIdInDb,
                                productId: dbProduct.id
                            }
                        },
                        update: {
                            quantity: { increment: item.quantityGiven }
                        },
                        create: {
                            employeeId: employeeIdInDb,
                            productId: dbProduct.id,
                            quantity: item.quantityGiven
                        }
                    })
                }
            }

            return visit
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Job Assignment Error:", error)
        return NextResponse.json({ error: error.message || 'Failed to assign job' }, { status: 500 })
    }
}
