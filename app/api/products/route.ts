import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const countOnly = searchParams.get('countOnly')

        if (countOnly === 'true') {
            const count = await prisma.product.count()
            return NextResponse.json({ count })
        }

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
        const { productId, name, category, quantityAvailable, unit, supplierName, dateOfPurchase, remarks } = body

        const product = await prisma.product.create({
            data: {
                productId,
                name,
                category: category || 'CHEMICAL',
                quantityAvailable: parseFloat(quantityAvailable || 0),
                quantityPurchased: parseFloat(quantityAvailable || 0),
                unit,
                supplierName: supplierName || null,
                dateOfPurchase: dateOfPurchase ? new Date(dateOfPurchase) : null,
                remarks: remarks || null,
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
