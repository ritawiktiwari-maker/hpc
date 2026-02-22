import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employeeId') // This is the public employeeId (e.g. EMP001)

        if (!employeeId) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
        }

        const employee = await prisma.employee.findUnique({
            where: { employeeId },
            include: {
                stockInHand: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        // Map to a cleaner format for frontend
        const formattedStock = employee.stockInHand.map(item => ({
            productId: item.productId, // UUID
            publicProductId: item.product.productId, // string (PRD001)
            productName: item.product.name,
            quantityGiven: item.quantity,
            unit: item.product.unit
        }))

        return NextResponse.json(formattedStock)
    } catch (error: any) {
        console.error("Employee Stock API Error:", error)
        return NextResponse.json({ error: 'Failed to fetch employee stock' }, { status: 500 })
    }
}
