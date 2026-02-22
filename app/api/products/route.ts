import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, quantityAvailable, unit } = body

        const product = await prisma.product.create({
            data: {
                name,
                quantityAvailable: parseFloat(quantityAvailable || 0),
                unit,
                stockTransactions: {
                    create: {
                        type: 'PURCHASE',
                        quantity: parseFloat(quantityAvailable || 0),
                        remarks: 'Initial stock'
                    }
                }
            }
        })

        return NextResponse.json(product)
    } catch (error: any) {
        console.error("Product Create Error:", error)
        return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 })
    }
}
