import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/clear-stock
 * Wipes all stock-related transactional data and resets product quantities to 0.
 * This is a destructive admin-only operation.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        // Require a confirmation flag
        if (!body.confirm) {
            return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete all return items & requests
            await tx.stockReturnItem.deleteMany({})
            await tx.stockReturnRequest.deleteMany({})

            // 2. Delete all visit product usages
            await tx.visitProductUsage.deleteMany({})

            // 3. Delete all employee stock
            await tx.employeeStock.deleteMany({})

            // 4. Delete all stock transactions
            await tx.stockTransaction.deleteMany({})

            // 5. Reset all product quantities to 0
            await tx.product.updateMany({
                data: {
                    quantityAvailable: 0,
                    quantityPurchased: 0,
                }
            })
        })

        return NextResponse.json({ success: true, message: 'All stock data cleared and quantities reset to 0.' })
    } catch (error: any) {
        console.error('Clear Stock Error:', error)
        return NextResponse.json({ error: 'Failed to clear stock data', details: error.message }, { status: 500 })
    }
}
