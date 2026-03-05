import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id
        const body = await request.json()

        // Handle Restock
        if (body.action === 'restock') {
            const { quantityAdded } = body
            if (!quantityAdded || isNaN(quantityAdded)) {
                return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
            }

            const product = await prisma.$transaction(async (tx) => {
                const updatedProduct = await tx.product.update({
                    where: { id },
                    data: {
                        quantityAvailable: { increment: quantityAdded }
                    }
                })

                await tx.stockTransaction.create({
                    data: {
                        productId: id,
                        type: 'PURCHASE',
                        quantity: quantityAdded,
                        remarks: 'Restocked'
                    }
                })
                return updatedProduct
            })
            return NextResponse.json(product)
        }

        // Handle standard Edit
        const { name, unit } = body
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(unit && { unit }),
            }
        })
        return NextResponse.json(product)
    } catch (error) {
        console.error("Product Update Error:", error)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id

        // Cascade delete using transaction
        await prisma.$transaction(async (tx) => {
            await tx.stockTransaction.deleteMany({ where: { productId: id } })
            await tx.employeeStock.deleteMany({ where: { productId: id } })
            await tx.visitProductUsage.deleteMany({ where: { productId: id } })
            await tx.stockReturnItem.deleteMany({ where: { productId: id } })

            await tx.product.delete({ where: { id } })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Product Delete Error:", error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
