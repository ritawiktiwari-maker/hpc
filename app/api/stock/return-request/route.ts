import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const employeeId = searchParams.get('employeeId')

        const requests = await prisma.stockReturnRequest.findMany({
            where: {
                ...(status ? { status } : {}),
                ...(employeeId ? { employeeId } : {}),
            },
            include: {
                employee: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { requestedAt: 'desc' }
        })

        return NextResponse.json(requests)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch return requests' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { employeeId, items } = body // items: [{ productId (could be public code or UUID), quantity }]

        const employee = await prisma.employee.findUnique({
            where: { employeeId: employeeId }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        // Resolve each productId (public code like PRD0001) to internal UUID
        const resolvedItems = await Promise.all(items.map(async (item: any) => {
            // Try to find by internal UUID first, then by public productId
            let product = await prisma.product.findUnique({ where: { id: item.productId } })
            if (!product) {
                product = await prisma.product.findUnique({ where: { productId: item.productId } })
            }
            if (!product) throw new Error(`Product ${item.productId} not found`)
            return { productId: product.id, quantity: parseFloat(item.quantity) }
        }))

        const returnRequest = await prisma.stockReturnRequest.create({
            data: {
                employeeId: employee.id,
                status: 'PENDING',
                items: {
                    create: resolvedItems
                }
            },
            include: {
                items: { include: { product: true } },
                employee: true,
            }
        })

        return NextResponse.json(returnRequest)
    } catch (error: any) {
        console.error("Stock Return Request Error:", error)
        return NextResponse.json({ error: 'Failed to create return request', details: error.message }, { status: 500 })
    }
}

