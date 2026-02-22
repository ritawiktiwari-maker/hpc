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
        const { isActive, name, mobileNumber, address } = body

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...(isActive !== undefined && { isActive }),
                ...(name && { name }),
                ...(mobileNumber && { mobileNumber }),
                ...(address && { address }),
            }
        })
        return NextResponse.json(employee)
    } catch (error) {
        console.error("Employee Update Error:", error)
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }
}
