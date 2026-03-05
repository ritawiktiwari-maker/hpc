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
        const { status, remarks } = body

        // Handle updating a visit (job)
        const visit = await prisma.visit.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(status === 'COMPLETED' && { completionDate: new Date() }),
                // Could store remarks if added to schema, currently Visit doesn't have remarks field
                // but contract might, or just ignore if not present
            }
        })
        return NextResponse.json(visit)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id

        await prisma.$transaction(async (tx) => {
            // Revert stock transactions? (Complex logic, omitting for simple delete unless specified)
            await tx.visitProductUsage.deleteMany({ where: { visitId: id } })
            await tx.visit.delete({ where: { id } })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }
}
