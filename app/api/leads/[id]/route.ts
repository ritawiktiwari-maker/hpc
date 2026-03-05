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
        const { name, mobile, address, source, status, followedById } = body

        const lead = await prisma.lead.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(mobile && { mobile }),
                ...(address !== undefined && { address }),
                ...(source !== undefined && { source }),
                ...(status && { status }),
                ...(followedById !== undefined && { followedById }),
            }
        })
        return NextResponse.json(lead)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id

        await prisma.lead.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
    }
}
