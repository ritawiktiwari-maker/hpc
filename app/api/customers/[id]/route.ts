import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id
        const body = await request.json()
        const { name, contactNumber, address, email } = body

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                contactNumber,
                address,
                email
            }
        })
        return NextResponse.json(customer)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id

        await prisma.customer.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
    }
}
