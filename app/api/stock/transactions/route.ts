import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
        const type = searchParams.get('type')

        const transactions = await prisma.stockTransaction.findMany({
            where: {
                ...(productId ? { productId } : {}),
                ...(type ? { type } : {}),
            },
            include: {
                product: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stock transactions' }, { status: 500 })
    }
}
