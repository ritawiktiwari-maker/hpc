import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
        const type = searchParams.get('type')

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '100')
        const skip = (page - 1) * limit

        const transactions = await prisma.stockTransaction.findMany({
            where: {
                ...(productId ? { productId } : {}),
                ...(type ? { type } : {}),
            },
            include: {
                product: {
                    select: { id: true, productId: true, name: true, unit: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })

        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stock transactions' }, { status: 500 })
    }
}
